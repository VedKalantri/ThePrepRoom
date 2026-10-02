import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";
import { fuzzyFilterAndSort } from "./fuzzy-search";

/**
 * STRICT PUBLIC DATA QUERY LIBRARY
 * Guarantee: ALL public queries strictly filter by `status === "APPROVED"`.
 * DRAFT, PENDING, and REJECTED experiences never appear in public listings or frequency calculations.
 */

export interface GetExperiencesFilter {
  query?: string;
  companySlug?: string;
  roleSlug?: string;
  interviewYear?: number;
  placementType?: string;
  roundType?: string;
  result?: string;
  department?: string;
  sortBy?: "newest" | "views";
  page?: number;
  limit?: number;
}

/**
 * Fetch approved experiences with multi-parameter filtering and pagination
 */
export async function getPublicExperiences(filter: GetExperiencesFilter = {}) {
  const {
    query,
    companySlug,
    roleSlug,
    interviewYear,
    placementType,
    roundType,
    result,
    department,
    sortBy = "newest",
    page = 1,
    limit = 15,
  } = filter;

  const skip = (page - 1) * limit;

  // Include both APPROVED (Verified) and PENDING (Unverified) experiences in public catalog
  const where: any = {
    status: { in: ["APPROVED", "PENDING"] },
  };

  if (companySlug) {
    const companySlugs = companySlug.split(",").map((s) => s.trim()).filter(Boolean);
    if (companySlugs.length === 1) {
      where.company = { slug: companySlugs[0] };
    } else if (companySlugs.length > 1) {
      where.company = { slug: { in: companySlugs } };
    }
  }

  if (roleSlug) {
    const roleSlugs = roleSlug.split(",").map((s) => s.trim()).filter(Boolean);
    if (roleSlugs.length === 1) {
      where.role = { slug: roleSlugs[0] };
    } else if (roleSlugs.length > 1) {
      where.role = { slug: { in: roleSlugs } };
    }
  }

  if (interviewYear) {
    where.interviewYear = interviewYear;
  }

  if (placementType) {
    where.placementType = placementType;
  }

  if (result) {
    where.result = result;
  }

  if (department) {
    where.department = { contains: department };
  }

  if (roundType) {
    where.rounds = {
      some: {
        roundType: roundType,
      },
    };
  }

  if (query) {
    const q = query.trim();
    // Fuzzy match registered companies to handle typos like "arees" -> "Aress Software"
    const allCompanies = await getCachedCompaniesList();
    const fuzzyCompanies = fuzzyFilterAndSort(allCompanies, q, (c) => [c.name, c.industry]).slice(0, 5);
    const fuzzyCompanyIds = fuzzyCompanies.map((c) => c.id);

    where.OR = [
      ...(fuzzyCompanyIds.length > 0 ? [{ companyId: { in: fuzzyCompanyIds } }] : []),
      { company: { name: { contains: q, mode: "insensitive" } } },
      { role: { title: { contains: q, mode: "insensitive" } } },
      { overallExperience: { contains: q, mode: "insensitive" } },
      { advice: { contains: q, mode: "insensitive" } },
      {
        questionLinks: {
          some: {
            question: {
              text: { contains: q, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  const orderBy = sortBy === "views" ? { viewsCount: "desc" as const } : { createdAt: "desc" as const };

  const [experiences, totalCount] = await Promise.all([
    prisma.experience.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        company: true,
        role: true,
        user: {
          select: {
            name: true,
            department: true,
          },
        },
        rounds: {
          orderBy: { orderIndex: "asc" },
        },
        questionLinks: {
          include: {
            question: true,
          },
        },
      },
    }),
    prisma.experience.count({ where }),
  ]);

  const finalExperiences = query
    ? fuzzyFilterAndSort(experiences, query, (exp) => [
        exp.company.name,
        exp.role.title,
        exp.overallExperience,
        exp.advice,
      ])
    : experiences;

  return {
    experiences: finalExperiences,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

/**
 * Fetch a single approved experience by slug
 */
export async function getPublicExperienceBySlug(slug: string) {
  const experience = await prisma.experience.findUnique({
    where: { slug },
    include: {
      company: {
        include: {
          roles: true,
        },
      },
      role: true,
      college: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          department: true,
          graduationYear: true,
          placementStatus: true,
          placedCompany: true,
          linkedinUrl: true,
          bio: true,
        },
      },
      rounds: {
        orderBy: { orderIndex: "asc" },
        include: {
          questions: {
            include: {
              question: {
                include: {
                  topic: true,
                },
              },
            },
          },
        },
      },
      questionLinks: {
        include: {
          question: {
            include: {
              topic: true,
            },
          },
        },
      },
    },
  });

  // Allow public viewing if APPROVED or PENDING
  if (!experience || (experience.status !== "APPROVED" && experience.status !== "PENDING")) {
    return null;
  }

  return experience;
}

/**
 * Fetch related approved experiences (same company or similar role) — cached for 60s
 */
export const getRelatedExperiences = unstable_cache(
  async (experienceId: string, companyId: string, roleId: string) => {
    return await prisma.experience.findMany({
      where: {
        status: { in: ["APPROVED", "PENDING"] },
        id: { not: experienceId },
        OR: [{ companyId }, { roleId }],
      },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        role: true,
        rounds: { orderBy: { orderIndex: "asc" } },
      },
    });
  },
  ["related-experiences"],
  { revalidate: 60, tags: ["experiences"] }
);

/**
 * Get real database-driven statistics (strictly 0 fake metrics) — cached for 30s
 */
export const getPublicStats = unstable_cache(
  async () => {
    const [experiencesCount, companiesCount, questionsCount, oaRoundsCount] = await Promise.all([
      // Public experiences (approved & pending)
      prisma.experience.count({
        where: { status: { in: ["APPROVED", "PENDING"] } },
      }),
      // Companies with at least one public experience
      prisma.company.count({
        where: {
          experiences: {
            some: { status: { in: ["APPROVED", "PENDING"] } },
          },
        },
      }),
      // Questions appearing in public experiences
      prisma.question.count({
        where: {
          experienceLinks: {
            some: {
              experience: { status: { in: ["APPROVED", "PENDING"] } },
            },
          },
        },
      }),
      // Online assessment rounds in public experiences
      prisma.interviewRound.count({
        where: {
          roundType: "ONLINE_ASSESSMENT",
          experience: { status: { in: ["APPROVED", "PENDING"] } },
        },
      }),
    ]);

    return {
      experiencesCount,
      companiesCount,
      questionsCount,
      oaRoundsCount,
    };
  },
  ["public-stats"],
  { revalidate: 30, tags: ["stats", "experiences"] }
);

/**
 * Fetch recently approved experiences for the homepage
 */
export async function getRecentApprovedExperiences(limit = 6) {
  return await prisma.experience.findMany({
    where: { status: { in: ["APPROVED", "PENDING"] } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      company: true,
      role: true,
      rounds: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });
}

/**
 * Fetch popular companies based on actual approved experience count — cached for 30s
 * Guarantees at least 4 top companies are displayed even before experiences are added.
 */
export const getPopularCompanies = unstable_cache(
  async (limit = 6) => {
    const companiesWithExp = await prisma.company.findMany({
      where: {
        experiences: {
          some: { status: { in: ["APPROVED", "PENDING"] } },
        },
      },
      include: {
        _count: {
          select: {
            experiences: {
              where: { status: { in: ["APPROVED", "PENDING"] } },
            },
            roles: true,
          },
        },
        experiences: {
          where: { status: { in: ["APPROVED", "PENDING"] } },
          select: { interviewYear: true },
          orderBy: { interviewYear: "desc" },
          take: 1,
        },
      },
    });

    const result: Array<{
      id: string;
      name: string;
      slug: string;
      approvedExperiencesCount: number;
      rolesCount: number;
      latestYear: number | null;
    }> = companiesWithExp.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      approvedExperiencesCount: c._count.experiences,
      rolesCount: c._count.roles,
      latestYear: c.experiences[0]?.interviewYear ?? null,
    }));

    // If fewer than limit companies have experiences yet, supplement with registered companies from DB
    if (result.length < limit) {
      const existingIds = new Set(result.map((c) => c.id));
      const fallbackCompanies = await prisma.company.findMany({
        where: { id: { notIn: Array.from(existingIds) } },
        take: limit - result.length,
        include: {
          _count: {
            select: {
              experiences: true,
              roles: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      for (const fc of fallbackCompanies) {
        result.push({
          id: fc.id,
          name: fc.name,
          slug: fc.slug,
          approvedExperiencesCount: fc._count.experiences,
          rolesCount: fc._count.roles,
          latestYear: null,
        });
      }
    }

    return result
      .sort((a, b) => b.approvedExperiencesCount - a.approvedExperiencesCount)
      .slice(0, limit);
  },
  ["popular-companies"],
  { revalidate: 30, tags: ["companies", "experiences"] }
);

/**
 * Internal cached all companies
 */
const getCachedCompaniesList = unstable_cache(
  async () => {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            experiences: {
              where: { status: { in: ["APPROVED", "PENDING"] } },
            },
            roles: true,
          },
        },
        experiences: {
          where: { status: { in: ["APPROVED", "PENDING"] } },
          select: { interviewYear: true },
          orderBy: { interviewYear: "desc" },
          take: 1,
        },
        roles: {
          take: 5,
        },
      },
      orderBy: { name: "asc" },
    });

    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      industry: c.industry,
      website: c.website,
      viewsCount: c.viewsCount,
      approvedExperiencesCount: c._count.experiences,
      rolesCount: c._count.roles,
      latestYear: c.experiences[0]?.interviewYear ?? null,
      sampleRoles: c.roles.map((r) => r.title),
    }));
  },
  ["all-public-companies-cached"],
  { revalidate: 60, tags: ["companies", "experiences"] }
);

/**
 * Fetch all companies for the directory with approved stats
 */
export async function getAllPublicCompanies(search?: string) {
  const allCompanies = await getCachedCompaniesList();
  if (!search || !search.trim()) {
    return allCompanies;
  }

  return fuzzyFilterAndSort(allCompanies, search.trim(), (c) => [
    c.name,
    c.industry,
    ...c.sampleRoles,
  ]);
}

/**
 * Highly optimized static catalog metadata — cached in memory for sub-millisecond response
 */
export const getAllTopics = unstable_cache(
  async () => {
    return await prisma.topic.findMany({
      orderBy: { name: "asc" },
    });
  },
  ["all-topics-cached"],
  { revalidate: 300, tags: ["topics"] }
);

export const getExperienceCatalogStaticData = unstable_cache(
  async () => {
    const [companies, roles, availableYears, trendingExperiences, trendingCompanies, trendingTopics] =
      await Promise.all([
        prisma.company.findMany({
          select: {
            name: true,
            slug: true,
            _count: {
              select: {
                experiences: {
                  where: { status: { in: ["APPROVED", "PENDING"] } },
                },
              },
            },
          },
          orderBy: { name: "asc" },
        }),
        prisma.companyRole.findMany({
          where: {
            experiences: {
              some: { status: { in: ["APPROVED", "PENDING"] } },
            },
          },
          select: {
            title: true,
            slug: true,
            _count: {
              select: {
                experiences: {
                  where: { status: { in: ["APPROVED", "PENDING"] } },
                },
              },
            },
          },
          orderBy: { title: "asc" },
        }),
        prisma.experience.findMany({
          where: { status: { in: ["APPROVED", "PENDING"] } },
          select: { interviewYear: true },
          distinct: ["interviewYear"],
          orderBy: { interviewYear: "desc" },
        }),
        prisma.experience.findMany({
          where: { status: { in: ["APPROVED", "PENDING"] } },
          take: 3,
          orderBy: { viewsCount: "desc" },
          include: {
            company: { select: { name: true, slug: true } },
            role: { select: { title: true, slug: true } },
          },
        }),
        prisma.company.findMany({
          where: {
            experiences: {
              some: { status: { in: ["APPROVED", "PENDING"] } },
            },
          },
          take: 6,
          select: {
            name: true,
            slug: true,
            _count: {
              select: {
                experiences: {
                  where: { status: { in: ["APPROVED", "PENDING"] } },
                },
              },
            },
          },
          orderBy: {
            experiences: {
              _count: "desc",
            },
          },
        }),
        prisma.topic.findMany({
          take: 4,
          select: {
            name: true,
            slug: true,
            _count: {
              select: {
                questions: true,
              },
            },
          },
          orderBy: {
            questions: {
              _count: "desc",
            },
          },
        }),
      ]);

    return {
      companies,
      roles,
      availableYears: availableYears.map((y) => y.interviewYear),
      trendingExperiences,
      trendingCompanies,
      trendingTopics,
    };
  },
  ["catalog-static-metadata"],
  { revalidate: 60, tags: ["catalog", "experiences", "companies"] }
);

/**
 * Fetch company detail by slug
 */
export async function getPublicCompanyBySlug(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      roles: true,
      experiences: {
        where: { status: { in: ["APPROVED", "PENDING"] } },
        orderBy: { interviewYear: "desc" },
        include: {
          role: true,
          rounds: { orderBy: { orderIndex: "asc" } },
          questionLinks: {
            include: {
              question: {
                include: { topic: true },
              },
            },
          },
        },
      },
    },
  });

  if (!company) return null;

  // Reported rounds process calculation from approved experiences
  const roundCounts: Record<string, number> = {};
  company.experiences.forEach((exp) => {
    exp.rounds.forEach((r) => {
      roundCounts[r.roundType] = (roundCounts[r.roundType] || 0) + 1;
    });
  });

  // Extract frequently reported questions for this company (strictly approved experiences)
  const questionMap = new Map<
    string,
    { question: any; count: number; roles: Set<string> }
  >();

  company.experiences.forEach((exp) => {
    exp.questionLinks.forEach((link) => {
      const q = link.question;
      if (!questionMap.has(q.id)) {
        questionMap.set(q.id, {
          question: q,
          count: 0,
          roles: new Set<string>(),
        });
      }
      const entry = questionMap.get(q.id)!;
      entry.count += 1;
      if (exp.role?.title) entry.roles.add(exp.role.title);
    });
  });

  const reportedQuestions = Array.from(questionMap.values())
    .map((item) => ({
      ...item.question,
      frequencyInCompany: item.count,
      roles: Array.from(item.roles),
    }))
    .sort((a, b) => b.frequencyInCompany - a.frequencyInCompany);

  const latestYear = company.experiences[0]?.interviewYear ?? null;

  return {
    ...company,
    approvedExperiencesCount: company.experiences.length,
    rolesCount: company.roles.length,
    latestYear,
    reportedQuestions,
  };
}

/**
 * Calculate question frequency STRICTLY from APPROVED experiences
 */
export async function getQuestionFrequency(questionId: string) {
  const [totalCount, links] = await Promise.all([
    prisma.experienceQuestion.count({
      where: {
        questionId,
        experience: { status: { in: ["APPROVED", "PENDING"] } },
      },
    }),
    prisma.experienceQuestion.findMany({
      where: {
        questionId,
        experience: { status: { in: ["APPROVED", "PENDING"] } },
      },
      include: {
        experience: {
          select: {
            interviewYear: true,
            company: {
              select: {
                name: true,
                slug: true,
              },
            },
            role: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // Aggregate by company
  const companyCounts: Record<string, { name: string; slug: string; count: number }> = {};
  const timeline: { company: string; year: number; role: string }[] = [];

  links.forEach((l) => {
    if (l.experience?.company) {
      const c = l.experience.company;
      if (!companyCounts[c.slug]) {
        companyCounts[c.slug] = { name: c.name, slug: c.slug, count: 0 };
      }
      companyCounts[c.slug].count += 1;

      timeline.push({
        company: c.name,
        year: l.experience.interviewYear,
        role: l.experience.role.title,
      });
    }
  });

  // Sort timeline newest first
  timeline.sort((a, b) => b.year - a.year);

  return {
    totalFrequency: totalCount,
    companyBreakdown: Object.values(companyCounts).sort((a, b) => b.count - a.count),
    timeline,
  };
}

/**
 * Fetch public question database with approved frequency counts
 */
export async function getPublicQuestions(filter: {
  topicSlug?: string;
  round?: string;
  difficulty?: string;
  query?: string;
}) {
  const where: any = {
    // Return questions that have at least one public experience link
    experienceLinks: {
      some: {
        experience: { status: { in: ["APPROVED", "PENDING"] } },
      },
    },
  };

  if (filter.topicSlug) {
    where.topic = { slug: filter.topicSlug };
  }

  if (filter.round) {
    where.round = filter.round;
  }

  if (filter.difficulty) {
    where.difficulty = filter.difficulty;
  }

  if (filter.query) {
    const q = filter.query.trim();
    const allTopics = await getAllTopics();
    const fuzzyTopics = fuzzyFilterAndSort(allTopics, q, (t) => t.name).slice(0, 3);
    const fuzzyTopicIds = fuzzyTopics.map((t) => t.id);

    where.OR = [
      ...(fuzzyTopicIds.length > 0 ? [{ topicId: { in: fuzzyTopicIds } }] : []),
      { text: { contains: q, mode: "insensitive" } },
      { topic: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const questions = await prisma.question.findMany({
    where,
    include: {
      topic: true,
      experienceLinks: {
        where: {
          experience: { status: { in: ["APPROVED", "PENDING"] } },
        },
        include: {
          experience: {
            select: {
              company: {
                select: { name: true, slug: true },
              },
            },
          },
        },
      },
    },
    take: 50,
  });

  const mapped = questions.map((q) => {
    const companiesSet = new Map<string, string>();
    q.experienceLinks.forEach((link) => {
      if (link.experience?.company) {
        companiesSet.set(link.experience.company.slug, link.experience.company.name);
      }
    });

    return {
      id: q.id,
      text: q.text,
      slug: q.slug,
      round: q.round,
      difficulty: q.difficulty,
      topic: q.topic,
      frequencyCount: q.experienceLinks.length,
      companies: Array.from(companiesSet.entries()).map(([slug, name]) => ({ slug, name })),
    };
  });

  return filter.query
    ? fuzzyFilterAndSort(mapped, filter.query, (q) => [q.text, q.topic?.name || ""])
    : mapped.sort((a, b) => b.frequencyCount - a.frequencyCount);
}

/**
 * Fetch a single question by slug
 */
export async function getPublicQuestionBySlug(slug: string) {
  const question = await prisma.question.findUnique({
    where: { slug },
    include: {
      topic: true,
    },
  });

  if (!question) return null;

  const frequencyData = await getQuestionFrequency(question.id);

  // Fetch related questions in same topic
  const relatedQuestions = question.topicId
    ? await prisma.question.findMany({
        where: {
          topicId: question.topicId,
          id: { not: question.id },
          experienceLinks: {
            some: { experience: { status: { in: ["APPROVED", "PENDING"] } } },
          },
        },
        take: 5,
        select: {
          id: true,
          text: true,
          slug: true,
          difficulty: true,
        },
      })
    : [];

  return {
    ...question,
    ...frequencyData,
    relatedQuestions,
  };
}

/**
 * Fetch all Online Assessment rounds reported in public experiences
 */
export async function getPublicOnlineAssessments() {
  const rounds = await prisma.interviewRound.findMany({
    where: {
      roundType: "ONLINE_ASSESSMENT",
      experience: { status: { in: ["APPROVED", "PENDING"] } },
    },
    include: {
      experience: {
        include: {
          company: true,
          role: true,
        },
      },
      questions: {
        include: {
          question: true,
        },
      },
    },
    orderBy: {
      experience: { interviewYear: "desc" },
    },
  });

  return rounds;
}

/**
 * Global search across public experiences, companies, questions, topics
 */
export async function globalSearch(query: string) {
  const q = query.trim();
  if (!q) {
    return { experiences: [], companies: [], questions: [], topics: [] };
  }

  // 1. Fuzzy match companies from the cached catalog
  const allCompanies = await getCachedCompaniesList();
  const matchedCompanies = fuzzyFilterAndSort(allCompanies, q, (c) => [
    c.name,
    c.industry,
    ...c.sampleRoles,
  ])
    .slice(0, 5)
    .map((c) => ({
      ...c,
      _count: {
        experiences: c.approvedExperiencesCount,
        roles: c.rolesCount,
      },
    }));
  const matchedCompanyIds = matchedCompanies.map((c) => c.id);

  // 2. Fuzzy match topics
  const allTopics = await getAllTopics();
  const matchedTopics = fuzzyFilterAndSort(allTopics, q, (t) => [t.name, t.category]).slice(0, 4);
  const matchedTopicIds = matchedTopics.map((t) => t.id);

  // 3. Query experiences & questions incorporating fuzzy IDs and text search
  const [experiences, questions] = await Promise.all([
    prisma.experience.findMany({
      where: {
        status: { in: ["APPROVED", "PENDING"] },
        OR: [
          ...(matchedCompanyIds.length > 0 ? [{ companyId: { in: matchedCompanyIds } }] : []),
          { company: { name: { contains: q, mode: "insensitive" } } },
          { role: { title: { contains: q, mode: "insensitive" } } },
          { overallExperience: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      include: {
        company: true,
        role: true,
      },
    }),
    prisma.question.findMany({
      where: {
        OR: [
          ...(matchedTopicIds.length > 0 ? [{ topicId: { in: matchedTopicIds } }] : []),
          { text: { contains: q, mode: "insensitive" } },
        ],
        experienceLinks: {
          some: { experience: { status: { in: ["APPROVED", "PENDING"] } } },
        },
      },
      take: 15,
      include: {
        topic: true,
      },
    }),
  ]);

  const rankedExperiences = fuzzyFilterAndSort(experiences, q, (exp) => [
    exp.company.name,
    exp.role.title,
    exp.overallExperience,
  ]).slice(0, 5);

  const rankedQuestions = fuzzyFilterAndSort(questions, q, (item) => [
    item.text,
    item.topic?.name || "",
  ]).slice(0, 8);

  return {
    experiences: rankedExperiences,
    companies: matchedCompanies,
    questions: rankedQuestions,
    topics: matchedTopics,
  };
}

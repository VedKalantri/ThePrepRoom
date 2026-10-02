const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const rawCompaniesText = `Josh Software
FinIQ
Schneider Electric
Torrent Power Limited
Fox Solutions pvt. ltd
Aress Software
Johnson Controls
Netwin
The Motwane Manufacturing Pvt. Ltd&#x20;
Forvia Faurecia
PROEXCEL
QSpiders
Burns and McDonnell
Torrent Renewable Energy
Emerson
Aqeeq Technologies
Humanify&#x20;
Precon India
Technip Energies
Infosys for Female
Emerson Measurement Systems and Solutions India Pvt Ltd.
Unbox Robotics
Chemisight Consulting
Hind Rectifiers Ltd R&D Mumbai
One Design
Reliance Industries
ESDS Software Solution
Amazon
Tata Consulting Engineers
PayU&#x20;
IndiaMART
INSNAPSYS Technologies Pvt. Ltd.&#x20;
Lear&#x20;
HDFC Life
Generali Central Life Insurance
OneSolve
Pointmatrix
iTpreneur Edutech
TCS
NJ Group
Virtuoso Optoelectronics Ltd
Mesto
Kayens Technologies
SKHM India Private Limited (Magna)
SEOYON E-HWA
Bosch Limited
IBM
NVIDIA
AMD
Bandhan Life Insurance
Duroshox
TDS Capital IMF Pvt. Ltd.
Sumago
Vayve Mobility
Roblox studio & lua coding
CWD Limited
Inorbvict Healthcare
SJ CONTRACTS PVT. LTD.&#x20;
JNK india
Symtronics
Grassberry
Maestrotech
Ralson Tyres
WRS Energy Solutions LLP&#x20;
Neilsoft
Suba Solutions Pvt. Ltd.!
Ecolagro Venture Private Limited
Sulzer
Glatt
Zensar
Lucy Electric
JK Maini Precision Technology
Marken Health
Upturn India Technologies
Hadwise Technologies Pvt Ltd
Godrej & Boyce Mfg.co.Ltd
Mahindra Sona
Supreme Equipments
Tecnimont Pvt. Ltd.
ElectroMech
DMart
JK Cement
Wipro Pari
IFB
Neilsoft&#x20;&#x20;
Mahindra & Mahindra Ltd.
Veol Medical Technologies
Dynamic Crane
HIVER&#x20;
Hyosung T & D India Pvt. Ltd.
Stelemc
Aditya Birla Group
Bureau Veritas
Fortress Infracon Limited
Varank Tech
Pan Gulf Technologies
JK Maini
LEAP India Ltd
P99Soft
Aarti Pharmalabs
Economode Food Equipment
ABB
Nexergy
BirlaNu
Kingfa Science & Technology (India) Ltd
Ultratech Cement Ltd
Ultratech
KEAN Construction Pvt. Ltd!
Graphite India
Mosdorfer
HashedIn Technologies
SAKA Engineering Systems Pvt Ltd
Diageo
Montex&#x20;
Virtuoso Optoelectronics Ltd pune
Arkchem Systems Private Limited
Gansons Private Limited
Mahindra Holidays & Resorts
Graphon
Prothious Engineering Services
Technoforce&#x20;
Laxmi Organic
Hyosung
Crompton Mumbai
KSB
Policybazaar&#x20;
Ellora EPC
Torrent Power D2D
BRB STEEL – NASHIK
SPACK AUTOMOTIVES
Regan India
KLINGELNBERG INDIA PVT LTD
ALLEN Career Institute
Gharda Chemicals Limited
Vertiv Energy Private Limited
Jotun India Pvt. Ltd
Tube Investments of India Ltd.
CIE India
Yanfeng lndia Automotive
Mahindra Tractors
Ensylon Pvt. Ltd.
Puretrop Fruits Limited
Versigent&#x20;
Forcon Infra Pvt Ltd.
Yotta
Coriolis Technologies Pvt. Ltd.
PNT Robotics & Automation Solutions LLP.
Hind Rectifiers
"Artson Limited, a TATA Enterprise"
Probiontech Pvt ltd
Rishabh Instruments Pvt Ltd
Stelmec Ltd.
Samsonite&#x20;
Karamtara Engineering Ltd
Future Factory
SEDEMAC & Flash
IRTI-ROBOTICS
Techflow Engineers (I) Pvt. Ltd.
Apras Polymer
Welspun Enterprises Limited
Positive Metering Pumps (India) Pvt Ltd.
Koso
Parker Lord
Future Factry
Aryan Aero Space
Montex Glass Factry
Flash Electronics India Pvt. Ltd.
Sales – Polycab – Team
Federal Bank
Konar (Talent Acquisition)
eQ Technology
Vayve Mobality Pvt Ltd
Mungi Group
Stelmac
Mahindra & Mahindra Chakan
Jindal Poly Film
Volvo Group
Virtuoso # Mechanical & Electrical Campus Drive
Viatris \\
FMCG multinational company
FOX Solutions Pvt Ltd – IT & IoT Opportunities
Bosch_GA_2026_Batch
Bobst Company
SVI Carbon Pvt Ltd. Nashik
Aqeeq Technologies - ShopLinx
Lalit Pipes & Pipes Pvt. Ltd.
Berger Paints
"PayU(CS, IT,CSD, AI&DS) 2025-26"
Delfingen India Pvt. Ltd. Pune.
E+E Elektronik India Pvt. Ltd.
Immunity Infra Project
Arcel or Mittal Nippon Steel India Limited(AM/NS)
Fourvia Faurecia
Sam Agri Group \\
"Radico NV Distilleries Maharashtra Ltd., Chh. Sambhajinagar"`;

function cleanName(n) {
  return n
    .replace(/&#x20;/g, " ")
    .replace(/^["'\s]+|["'\s!,\\/]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Function to assign a reasonable industry category based on keywords
function guessIndustry(name) {
  const lower = name.toLowerCase();
  if (
    lower.includes("software") ||
    lower.includes("tech") ||
    lower.includes("cloud") ||
    lower.includes("systems") ||
    lower.includes("informatics") ||
    lower.includes("cyber") ||
    lower.includes("digital") ||
    lower.includes("data") ||
    lower.includes("robotics") ||
    lower.includes("yotta") ||
    lower.includes("ibm") ||
    lower.includes("nvidia") ||
    lower.includes("amd") ||
    lower.includes("amazon") ||
    lower.includes("tcs") ||
    lower.includes("hashedin") ||
    lower.includes("zensar") ||
    lower.includes("infosys") ||
    lower.includes("payu")
  ) {
    return "Technology & Software";
  }
  if (
    lower.includes("power") ||
    lower.includes("energy") ||
    lower.includes("electric") ||
    lower.includes("optoelectronics") ||
    lower.includes("electronics") ||
    lower.includes("schneider") ||
    lower.includes("emerson") ||
    lower.includes("abb")
  ) {
    return "Electrical & Energy";
  }
  if (
    lower.includes("automotive") ||
    lower.includes("mobility") ||
    lower.includes("motors") ||
    lower.includes("mahindra") ||
    lower.includes("volvo") ||
    lower.includes("bosch") ||
    lower.includes("tyres") ||
    lower.includes("faurecia")
  ) {
    return "Automotive & Mobility";
  }
  if (
    lower.includes("chemical") ||
    lower.includes("pharma") ||
    lower.includes("organic") ||
    lower.includes("healthcare") ||
    lower.includes("medical")
  ) {
    return "Chemicals & Healthcare";
  }
  if (
    lower.includes("cement") ||
    lower.includes("steel") ||
    lower.includes("infra") ||
    lower.includes("construction") ||
    lower.includes("engineering") ||
    lower.includes("tata consulting") ||
    lower.includes("ultratech") ||
    lower.includes("welspun")
  ) {
    return "Engineering & Infrastructure";
  }
  if (
    lower.includes("bank") ||
    lower.includes("life") ||
    lower.includes("capital") ||
    lower.includes("insurance") ||
    lower.includes("finiq") ||
    lower.includes("hdfc")
  ) {
    return "Banking, Financial Services & Insurance";
  }
  return "Engineering & Technology";
}

// Generate default recruitment roles for any company
function getStandardRoles(name, industry) {
  const ind = (industry || "").toLowerCase();
  if (ind.includes("software") || ind.includes("technology")) {
    return [
      "Software Engineer",
      "Associate Software Engineer",
      "Graduate Engineer Trainee",
    ];
  }
  if (ind.includes("electrical") || ind.includes("energy")) {
    return [
      "Graduate Engineer Trainee",
      "Electrical Engineer",
      "Associate Trainee Engineer",
    ];
  }
  if (ind.includes("automotive") || ind.includes("engineering")) {
    return [
      "Graduate Engineer Trainee",
      "Design Engineer",
      "Quality Engineer",
    ];
  }
  return [
    "Graduate Engineer Trainee",
    "Associate Engineer",
    "Management Trainee",
  ];
}

async function main() {
  console.log("Analyzing companies to import...");

  const rawLines = rawCompaniesText.split("\n");
  const parsedCompanies = [];
  const seenNames = new Set();
  const seenSlugs = new Set();

  for (const line of rawLines) {
    const cleaned = cleanName(line);
    if (!cleaned || cleaned.toLowerCase() === "company name") continue;

    const lowerName = cleaned.toLowerCase();
    if (seenNames.has(lowerName)) continue;
    seenNames.add(lowerName);

    let baseSlug = slugify(cleaned);
    if (!baseSlug) baseSlug = "company";
    let slug = baseSlug;
    let counter = 1;
    while (seenSlugs.has(slug)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    seenSlugs.add(slug);

    const industry = guessIndustry(cleaned);
    const roles = getStandardRoles(cleaned, industry);

    parsedCompanies.push({
      name: cleaned,
      slug,
      industry,
      roles,
    });
  }

  console.log(`Parsed ${parsedCompanies.length} unique companies from the list.`);

  // Check current companies in the database
  const currentCompanies = await prisma.company.findMany({
    include: {
      _count: {
        select: {
          experiences: true,
          roles: true,
        },
      },
      experiences: {
        select: { id: true, slug: true },
      },
    },
  });

  console.log(`Current companies in DB: ${currentCompanies.length}`);
  for (const c of currentCompanies) {
    console.log(`- ${c.name} (${c.slug}): ${c._count.experiences} experiences, ${c._count.roles} roles`);
  }

  // Identify companies that HAVE experiences (must be preserved so experiences aren't broken)
  const companiesWithExperiences = currentCompanies.filter((c) => c._count.experiences > 0);
  const preservedCompanyIds = new Set(companiesWithExperiences.map((c) => c.id));
  const preservedSlugs = new Set(companiesWithExperiences.map((c) => c.slug));
  const preservedNames = new Set(companiesWithExperiences.map((c) => c.name.toLowerCase()));

  console.log(`Preserving ${companiesWithExperiences.length} company(ies) with active user experiences:`);
  companiesWithExperiences.forEach((c) => console.log(`  * ${c.name} (id: ${c.id}, slug: ${c.slug})`));

  // Remove companies that have 0 experiences
  const companiesToDelete = currentCompanies.filter((c) => !preservedCompanyIds.has(c.id));
  console.log(`Deleting ${companiesToDelete.length} obsolete companies with 0 experiences...`);

  for (const comp of companiesToDelete) {
    // Delete roles first
    await prisma.companyRole.deleteMany({
      where: { companyId: comp.id },
    });
    // Delete company
    await prisma.company.delete({
      where: { id: comp.id },
    });
    console.log(`Deleted: ${comp.name}`);
  }

  // Insert or Upsert new companies
  console.log(`Inserting/Updating ${parsedCompanies.length} companies from the Excel sheet...`);
  let addedCount = 0;
  let updatedCount = 0;

  for (const item of parsedCompanies) {
    // Check if company already exists by name or slug
    let existing = await prisma.company.findFirst({
      where: {
        OR: [{ name: item.name }, { slug: item.slug }],
      },
      include: { roles: true },
    });

    if (existing) {
      // Update metadata
      await prisma.company.update({
        where: { id: existing.id },
        data: {
          industry: item.industry,
        },
      });
      // Ensure it has standard roles if none exist
      for (const roleTitle of item.roles) {
        const roleSlug = slugify(roleTitle);
        const hasRole = existing.roles.some((r) => r.slug === roleSlug);
        if (!hasRole) {
          await prisma.companyRole.create({
            data: {
              title: roleTitle,
              slug: roleSlug,
              companyId: existing.id,
            },
          });
        }
      }
      updatedCount++;
    } else {
      // Create fresh company with roles
      const newComp = await prisma.company.create({
        data: {
          name: item.name,
          slug: item.slug,
          industry: item.industry,
        },
      });

      for (const roleTitle of item.roles) {
        const roleSlug = slugify(roleTitle);
        await prisma.companyRole.create({
          data: {
            title: roleTitle,
            slug: roleSlug,
            companyId: newComp.id,
          },
        });
      }
      addedCount++;
    }
  }

  console.log(`Done! Added: ${addedCount}, Updated: ${updatedCount}`);

  const totalInDb = await prisma.company.count();
  const totalRoles = await prisma.companyRole.count();
  const totalExperiences = await prisma.experience.count();

  console.log(`Final Database Stats:`);
  console.log(`- Companies in DB: ${totalInDb}`);
  console.log(`- Company Roles in DB: ${totalRoles}`);
  console.log(`- Experiences in DB: ${totalExperiences}`);
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export type FacultyId = "arts-humanities" | "science" | "social-sciences-health" | "business";

export type DepartmentSource = {
  slug: string;
  zh: string;
  en: string;
  facultyId: FacultyId;
  /** Official pages that list the department's staff (relative to durham.ac.uk unless absolute). */
  sources: string[];
};

const D = "/departments/academic/";

export const departmentSources: DepartmentSource[] = [
  { slug: "classics-ancient-history", zh: "古典学与古代史系", en: "Classics and Ancient History", facultyId: "arts-humanities", sources: [D + "classics-ancient-history/about-us/people/"] },
  { slug: "english-studies", zh: "英语研究系", en: "English Studies", facultyId: "arts-humanities", sources: [D + "english-studies/about-us/academic-staff/"] },
  { slug: "history", zh: "历史系", en: "History", facultyId: "arts-humanities", sources: [D + "history/about-us/staff/academic-staff/"] },
  { slug: "music", zh: "音乐系", en: "Music", facultyId: "arts-humanities", sources: [D + "music/about-us/people/"] },
  { slug: "modern-languages-cultures", zh: "现代语言与文化学院", en: "Modern Languages and Cultures", facultyId: "arts-humanities", sources: [D + "modern-languages-cultures/about-us/our-people/"] },
  { slug: "philosophy", zh: "哲学系", en: "Philosophy", facultyId: "arts-humanities", sources: [D + "philosophy/about-us/people/"] },
  { slug: "theology-religion", zh: "神学与宗教系", en: "Theology and Religion", facultyId: "arts-humanities", sources: [D + "theology-religion/about-us/staff/academic-staff/"] },
  { slug: "biosciences", zh: "生物科学系", en: "Biosciences", facultyId: "science", sources: [D + "biosciences/about-us/staff/"] },
  { slug: "chemistry", zh: "化学系", en: "Chemistry", facultyId: "science", sources: [D + "chemistry/about-us/our-people/"] },
  { slug: "computer-science", zh: "计算机科学系", en: "Computer Science", facultyId: "science", sources: [D + "computer-science/about-us/staff/"] },
  { slug: "earth-sciences", zh: "地球科学系", en: "Earth Sciences", facultyId: "science", sources: [D + "earth-sciences/about-us/staff/"] },
  { slug: "engineering", zh: "工程系", en: "Engineering", facultyId: "science", sources: [D + "engineering/about-us/staff/"] },
  { slug: "mathematical-sciences", zh: "数学科学系", en: "Mathematical Sciences", facultyId: "science", sources: ["https://www.maths.dur.ac.uk/seminars/stlst/ts-academic.html"] },
  {
    slug: "physics", zh: "物理系", en: "Physics", facultyId: "science",
    sources: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => `https://www.physics.dur.ac.uk/stafflist/cmsphone_new.php?sort=${l}`),
  },
  { slug: "psychology", zh: "心理学系", en: "Psychology", facultyId: "science", sources: [D + "psychology/about/staff/"] },
  { slug: "anthropology", zh: "人类学系", en: "Anthropology", facultyId: "social-sciences-health", sources: [D + "anthropology/about-us/staff/"] },
  { slug: "archaeology", zh: "考古学系", en: "Archaeology", facultyId: "social-sciences-health", sources: [D + "archaeology/about-us/staff/"] },
  { slug: "education", zh: "教育学院", en: "School of Education", facultyId: "social-sciences-health", sources: [D + "education/about-us/people/"] },
  { slug: "geography", zh: "地理系", en: "Geography", facultyId: "social-sciences-health", sources: [D + "geography/about-us/staff/"] },
  { slug: "law", zh: "法学院", en: "Durham Law School", facultyId: "social-sciences-health", sources: [D + "law/about-us/staff/academic-staff/"] },
  { slug: "school-government-international-affairs", zh: "政府与国际事务学院", en: "Government and International Affairs", facultyId: "social-sciences-health", sources: [D + "school-government-international-affairs/about-us/staff/"] },
  { slug: "sociology", zh: "社会学系", en: "Sociology", facultyId: "social-sciences-health", sources: [D + "sociology/about-us/staff/"] },
  { slug: "sport-exercise-sciences", zh: "运动与锻炼科学系", en: "Sport and Exercise Sciences", facultyId: "social-sciences-health", sources: [D + "sport-exercise-sciences/about-us/people/"] },
  { slug: "business", zh: "杜伦大学商学院", en: "Durham University Business School", facultyId: "business", sources: ["/business/about/departments/accounting/our-people/academic-staff/", "/business/about/departments/economics/our-people/academic-staff/", "/business/about/departments/finance/our-people/academic-staff---research/", "/business/about/departments/finance/our-people/academic-staff---education/", "/business/about/departments/management-and-marketing/our-people/academic-staff-/", "/business/about/departments/management-and-marketing/our-people/academic-management-team/"] },
];

export const departmentBySlug = new Map(departmentSources.map((d) => [d.slug, d]));

export function departmentsForFaculty(facultyId: string) {
  return departmentSources.filter((d) => d.facultyId === facultyId).map((d) => d.slug);
}

const DEPT_EN_TO_SLUG: Record<string, string> = Object.fromEntries(
  departmentSources.map((d) => [d.en.toLowerCase(), d.slug]),
);
export function slugForDepartmentName(name: string) {
  const n = name.toLowerCase().replace(/^(department of|school of)\s+/, "");
  return DEPT_EN_TO_SLUG[name.toLowerCase()] ?? DEPT_EN_TO_SLUG[n] ?? departmentSources.find((d) => n.includes(d.en.toLowerCase()) || d.en.toLowerCase().includes(n))?.slug ?? null;
}

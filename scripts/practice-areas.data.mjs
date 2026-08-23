/**
 * The six practice areas, and how each one selects real matters out of the
 * case list in index.html. Copy here is descriptive of work already shown on
 * the site — it makes no claim of outcome and offers no legal advice.
 */
export const SITE = 'https://www.legalaccess.in';

export const AREAS = [
   {
      slug: 'supreme-court',
      name: 'Supreme Court Practice',
      title: 'Supreme Court Advocate — SLPs & Writ Petitions',
      description:
         'Special Leave Petitions, writs under Article 32, constitutional matters and appeals from the High Courts, argued before the Supreme Court of India.',
      lede:
         'Special Leave Petitions, writs under Article 32, constitutional matters and appeals from the High Courts — argued before the Supreme Court of India.',
      icon: 'scale',
      body: [
         'A matter reaching the Supreme Court is usually the end of a long road. By that stage the record is fixed, the findings below are on paper, and the question is which points survive scrutiny and how they are framed for the Bench. That framing is the work.',
         'Advocate Akhilesh Shrivastava has appeared before the Supreme Court of India across civil, criminal, company and constitutional matters, including Special Leave Petitions from High Court judgments, writs under Article 32, statutory civil appeals, and appeals arising from NCLAT and other tribunals.',
         'Several of the matters listed below travelled through the Company Law Board, NCLT and NCLAT before reaching the Supreme Court. Continuity of counsel across those stages means the record is already known when the appeal is drafted.'
      ],
      services: [
         'Special Leave Petitions (SLPs), civil and criminal',
         'Writ petitions under Article 32',
         'Statutory appeals from High Courts and tribunals',
         'Constitutional and interpretation questions',
         'Transfer petitions and connected applications',
         'Caveats, contempt and review petitions'
      ],
      forums: ['Supreme Court of India'],
      match: c => c.category === 'supreme'
   },
   {
      slug: 'corporate-company-law',
      name: 'Corporate & Company Law',
      title: 'Corporate & Company Law Advocate — NCLT & IBC',
      description:
         'Company law disputes, oppression and mismanagement, IBC and insolvency proceedings, and representation before NCLT, NCLAT and the High Courts.',
      lede:
         'Company law disputes, insolvency under the IBC, and representation before the NCLT, the NCLAT and the High Courts.',
      icon: 'building',
      body: [
         'Company disputes rarely stay in one forum. A shareholder petition can begin before the NCLT, move to the NCLAT, draw a parallel writ in the High Court and end at the Supreme Court — often over several years, with the commercial position shifting underneath it.',
         'The firm has acted in company law and insolvency matters from the Company Law Board era through the current NCLT and NCLAT regime, including corporate insolvency resolution proceedings, oppression and mismanagement petitions, shareholder and management-control disputes, and connected recovery litigation.',
         'Advocate Shrivastava holds both Company Secretary and Cost and Works Accountant qualifications alongside his LL.B, which is directly relevant where a dispute turns on accounts, valuation or statutory compliance rather than only on law.'
      ],
      services: [
         'Companies Act petitions and appeals',
         'Corporate insolvency resolution (CIRP) under the IBC',
         'NCLT and NCLAT representation',
         'Oppression and mismanagement petitions',
         'Shareholder and management-control disputes',
         'Corporate restructuring and scheme approvals'
      ],
      forums: ['NCLT', 'NCLAT', 'High Courts', 'Supreme Court of India'],
      match: c => /Company Law|Corporate Law|IBC|Commercial Law|Banking Law/i.test(c.tag)
   },
   {
      slug: 'appeals-appellate-practice',
      name: 'Appeals & Appellate Practice',
      title: 'Appellate Advocate — Civil & Criminal Appeals',
      description:
         'Appellate practice across the Supreme Court, High Courts, NCLAT and tribunals: civil and criminal appeals, SLPs, Companies Act and IBC appeals.',
      lede:
         'Appeals carried across the Supreme Court, the High Courts, the NCLAT and other tribunals — civil, criminal, company and statutory.',
      icon: 'file',
      body: [
         'An appeal is not a second trial. It is an argument about what the court below got wrong, confined to a record that can no longer be added to, and usually bound by a limitation period that has already started running.',
         'The firm handles appellate work as a distinct discipline: reading the judgment under challenge against the record, isolating the grounds that are genuinely arguable, and drafting so that the appellate court can see the error without reconstructing the whole case.',
         'The matters below span Special Leave Petitions, Letters Patent Appeals, first and second appeals, criminal appeals, and Companies Act and IBC appeals before the NCLAT — several carried through more than one appellate stage.'
      ],
      services: [
         'Special Leave Petitions to the Supreme Court',
         'Companies Act and IBC appeals before the NCLAT',
         'First and second appeals in the High Courts',
         'Letters Patent Appeals (LPA)',
         'Criminal appeals and revisions',
         'Condonation of delay and stay applications'
      ],
      forums: ['Supreme Court of India', 'High Courts', 'NCLAT', 'Tribunals'],
      match: c => /Appeal|SLP|LPA|NCLAT/i.test(c.court) || /Appeal|SLP|LPA/i.test(c.tag)
   },
   {
      slug: 'criminal-law-defence',
      name: 'Criminal Law & Defence',
      title: 'Criminal Defence Advocate — Bail & Quashing',
      description:
         'Criminal defence including bail applications, quashing of proceedings, criminal appeals, white-collar matters, and PMLA and UAPA proceedings.',
      lede:
         'Bail, quashing of proceedings, criminal appeals, and white-collar defence — including PMLA and UAPA matters.',
      icon: 'shield',
      body: [
         'Criminal matters move on their own clock. Bail, custody and interim protection are decided long before anything is tried, and the decisions taken in those first weeks tend to shape everything that follows.',
         'The firm appears in criminal matters at trial, revisional and appellate stages, including applications for quashing under the inherent jurisdiction of the High Court, regular and anticipatory bail, criminal appeals, and contempt proceedings.',
         'Where criminal exposure runs alongside a company or commercial dispute — as it often does in shareholder and recovery litigation — the criminal and civil strategies are run together rather than in separate silos.'
      ],
      services: [
         'Quashing of FIRs and criminal proceedings',
         'Regular and anticipatory bail applications',
         'Criminal appeals and revisions',
         'White-collar and economic offence defence',
         'PMLA and UAPA proceedings',
         'Contempt proceedings'
      ],
      forums: ['Supreme Court of India', 'High Courts', 'Sessions Courts'],
      match: c => /Criminal|Contempt/i.test(c.tag)
   },
   {
      slug: 'tax-excise-law',
      name: 'Tax & Excise Law',
      title: 'Tax & Excise Advocate — CESTAT & Customs',
      description:
         'Representation in income tax appeals, excise and service tax disputes, customs matters, and proceedings before CESTAT and the tax tribunals.',
      lede:
         'Income tax appeals, excise and service tax disputes, and customs matters before CESTAT and the tax tribunals.',
      icon: 'rupee',
      body: [
         'Tax disputes are won or lost on the record built at the assessment and first-appeal stage. By the time a matter reaches a tribunal, the findings of fact are largely settled and the argument narrows to law and to what the documents actually show.',
         'The firm advises and appears in direct and indirect tax disputes, including income tax appeals, excise and service tax proceedings before CESTAT, and customs matters — with attention to limitation, valuation and classification, where most of these disputes are actually decided.',
         'Advocate Shrivastava’s Cost and Works Accountant qualification is directly relevant here: many excise and valuation disputes turn on costing method rather than on statutory interpretation.'
      ],
      services: [
         'Income tax appeals and assessments',
         'CESTAT proceedings',
         'Excise and service tax disputes',
         'Customs classification and valuation disputes',
         'Show-cause notice replies and representations',
         'Refund, penalty and limitation issues'
      ],
      forums: ['CESTAT', 'Tax tribunals', 'High Courts', 'Supreme Court of India'],
      match: c => /Tax/i.test(c.tag)
   },
   {
      slug: 'human-rights-pil',
      name: 'Human Rights & PIL',
      title: 'Human Rights & PIL Advocate — NHRC Complaints',
      description:
         'Human rights advocacy and public interest litigation, including NHRC complaints, civil liberties matters and constitutional petitions.',
      lede:
         'Public interest litigation, NHRC complaints and civil liberties matters — much of it carried pro bono.',
      icon: 'users',
      body: [
         'Advocate Akhilesh Shrivastava has been a human rights activist since long before it formed part of his practice, and a share of the firm’s work in this area is carried without fee.',
         'The work covers public interest litigation on questions of governance and public administration, complaints before the National Human Rights Commission, constitutional petitions on civil liberties, and service and labour matters brought on behalf of workers and unions.',
         'The matters marked pro bono in the list below were argued on that basis. They are recorded here because they are part of the practice, not as a claim about any particular outcome.'
      ],
      services: [
         'Public interest litigation (PIL)',
         'NHRC complaints and human rights violations',
         'Constitutional petitions on civil liberties',
         'Labour, workmen and service matters',
         'Representation of unions and worker groups',
         'Pro bono representation'
      ],
      forums: ['Supreme Court of India', 'High Courts', 'NHRC'],
      match: c => /PIL|Human Rights|Constitutional Law|Pro Bono/i.test(c.tag)
   }
];

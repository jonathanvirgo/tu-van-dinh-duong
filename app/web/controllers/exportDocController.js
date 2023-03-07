var express         = require('express'),
    router          = express.Router(),
    webService      = require('./../models/webModel'),
    moment          = require('moment');

const docx = require("docx");
const { AlignmentType, Document, HeadingLevel, Packer, Paragraph } = docx;


const PHONE_NUMBER = "07534563401";
const PROFILE_URL = "https://www.linkedin.com/in/dolan1";
const EMAIL = "docx@com";


const experiences = [
    {
        isCurrent: true,
        summary: "Full-stack developer working with Angular and Java. Working for the iShares platform",
        title: "Associate Software Developer",
        startDate: {
            month: 11,
            year: 2017,
        },
        company: {
            name: "BlackRock",
        },
    },
    {
        isCurrent: false,
        summary:
            "Full-stack developer working with Angular, Node and TypeScript. Working for the iShares platform. Emphasis on Dev-ops and developing the continous integration pipeline.",
        title: "Software Developer",
        endDate: {
            month: 11,
            year: 2017,
        },
        startDate: {
            month: 10,
            year: 2016,
        },
        company: {
            name: "Torch Markets",
        },
    },
    {
        isCurrent: false,
        summary:
            "Used ASP.NET MVC 5 to produce a diversity data collection tool for the future of British television.\n\nUsed AngularJS and C# best practices. Technologies used include JavaScript, ASP.NET MVC 5, SQL, Oracle, SASS, Bootstrap, Grunt.",
        title: "Software Developer",
        endDate: {
            month: 10,
            year: 2016,
        },
        startDate: {
            month: 3,
            year: 2015,
        },
        company: {
            name: "Soundmouse",
        },
    },
    {
        isCurrent: false,
        summary:
            "Develop web commerce platforms for constious high profile clients.\n\nCreated a log analysis web application with the Play Framework in Java, incorporating Test Driven Development. It asynchronously uploads and processes large (2 GB) log files, and outputs meaningful results in context with the problem. \n\nAnalysis  and  development  of  the payment system infrastructure and user accounts section to be used by several clients of the company such as Waitrose, Tally Weijl, DJ Sports, Debenhams, Ann Summers, John Lewis and others.\n\nTechnologies used include WebSphere Commerce, Java, JavaScript and JSP.",
        title: "Java Developer",
        endDate: {
            month: 10,
            year: 2014,
        },
        startDate: {
            month: 3,
            year: 2013,
        },
        company: {
            name: "Soundmouse",
        },
    },
];

const education = [
    {
        degree: "Master of Science (MSc)",
        fieldOfStudy: "Computer Science",
        notes:
            "Exam Results: 1st Class with Distinction, Dissertation: 1st Class with Distinction\n\nRelevant Courses: Java and C# Programming, Software Engineering, Artificial Intelligence, \nComputational Photography, Algorithmics, Architecture and Hardware.\n\nCreated a Windows 8 game in JavaScript for the dissertation. \n\nCreated an award-winning 3D stereoscopic game in C# using XNA.",
        schoolName: "University College London",
        startDate: {
            year: 2012,
        },
        endDate: {
            year: 2013,
        },
    },
    {
        degree: "Bachelor of Engineering (BEng)",
        fieldOfStudy: "Material Science and Engineering",
        notes:
            "Exam Results: 2:1, Dissertation: 1st Class with Distinction\n\nRelevant courses: C Programming, Mathematics and Business for Engineers.",
        schoolName: "Imperial College London",
        startDate: {
            year: 2009,
        },
        endDate: {
            year: 2012,
        },
    },
];

const skills = [
    {
        name: "Angular",
    },
    {
        name: "TypeScript",
    },
    {
        name: "JavaScript",
    },
    {
        name: "NodeJS",
    },
];

const achievements = [
    {
        issuer: "Oracle",
        name: "Oracle Certified Expert",
    },
];

class DocumentCreator {
    create([experiences, educations, skills, achivements]) {
        const document = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        text: "Dolan Miu",
                        heading: HeadingLevel.TITLE,
                    }),
                    webService.createContactInfo(PHONE_NUMBER, PROFILE_URL, EMAIL),
                    webService.createHeading("Education"),
                    ...educations
                        .map((education) => {
                            const arr = [];
                            arr.push(
                                webService.createInstitutionHeader(education.schoolName, `${education.startDate.year} - ${education.endDate.year}`),
                            );
                            arr.push(webService.createRoleText(`${education.fieldOfStudy} - ${education.degree}`));

                            const bulletPoints = webService.splitParagraphIntoBullets(education.notes);
                            bulletPoints.forEach((bulletPoint) => {
                                arr.push(webService.createBullet(bulletPoint));
                            });

                            return arr;
                        })
                        .reduce((prev, curr) => prev.concat(curr), []),
                        webService.createHeading("Experience"),
                    ...experiences
                        .map((position) => {
                            const arr = [];

                            arr.push(
                                webService.createInstitutionHeader(
                                    position.company.name,
                                    webService.createPositionDateText(position.startDate, position.endDate, position.isCurrent),
                                ),
                            );
                            arr.push(webService.createRoleText(position.title));

                            const bulletPoints = webService.splitParagraphIntoBullets(position.summary);

                            bulletPoints.forEach((bulletPoint) => {
                                arr.push(webService.createBullet(bulletPoint));
                            });

                            return arr;
                        })
                        .reduce((prev, curr) => prev.concat(curr), []),
                        webService.createHeading("Skills, Achievements and Interests"),
                        webService.createSubHeading("Skills"),
                        webService.createSkillList(skills),
                        webService.createSubHeading("Achievements"),
                    ...webService.createAchivementsList(achivements),
                    webService.createSubHeading("Interests"),
                    webService.createInterests("Programming, Technology, Music Production, Web Design, 3D Modelling, Dancing."),
                    webService.createHeading("References"),
                    new Paragraph(
                        "Dr. Dean Mohamedally Director of Postgraduate Studies Department of Computer Science, University College London Malet Place, Bloomsbury, London WC1E d.mohamedally@ucl.ac.uk",
                    ),
                    new Paragraph("More references upon request"),
                    new Paragraph({
                        text: "This CV was generated in real-time based on my Linked-In profile from my personal website www.dolan.bio.",
                        alignment: AlignmentType.CENTER,
                    }),
                ],
            }],
        });
        return document;
    }
}
      

router.get('/example1', async function(req, res, next){
    try {
        const documentCreator = new DocumentCreator();
        const doc = documentCreator.create([experiences, education, skills, achievements]);
    
        const b64string = await Packer.toBase64String(doc);
        
        res.setHeader('Content-Disposition', 'attachment; filename=My Document.docx');
        res.send(Buffer.from(b64string, 'base64'));
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
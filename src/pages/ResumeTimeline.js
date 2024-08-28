import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResumeTimeline.css';

const Timeline = () => {
    const navigate = useNavigate();

    const events = [
        {
            title: "Regulatory Publishing Intern",
            org: "Regeneron Pharmaceuticals",
            date: "May 2023 – Aug 2024",
            description: (
                <>
                    Improved FDA submission efficiency by 15% through standardized document templates and automation routines.<br /><br />
                    Enhanced submission accuracy by 10% using Veeva Vault RIM, Docubridge, and Adobe Acrobat DC.<br /><br />
                    Mentored a fellow intern, streamlining team workflows and enhancing regulatory process understanding.
                </>
            ),
        },
        {
            title: "Research Assistant",
            org: "Lab for Intelligent Integrated Networks of Engineering Systems",
            date: "Jan 2023 – Current",
            description: (
                <>
                    Co-developed a codebase improving data transfer efficiency by 50% through optimized binary data conversion.<br /><br />
                    Automated processing of a 15,000+ page book of figures using a tool for data scraping, visualization, and sorting.<br /><br />
                    Verified laboratory data models by performing data scrubbing and statistical analysis.
                </>
            ),
        },
        {
            title: "Interactive Sensory Pad Engineer",
            org: "Independent Project",
            date: "Aug 2024",
            description: (
                <>
                    Developed an interactive sensory pad to aid a non-verbal child's speech challenges, facilitating verbal communication.<br /><br />
                    Engineered the pad using ESP32 microcontroller, DFPlayer Mini, and piezoelectric sensor for customized audio feedback.<br /><br />
                    Utilized C++ and Arduino IDE to ensure responsive and reliable operation of the sensory pad.
                </>
            ),
        },
        {
            title: "Vice President",
            org: "INCOSE Stevens Chapter",
            date: "Jun 2024 – Current",
            description: (
                <>
                    Led events and workshops to promote systems engineering.<br /><br />
                    Collaborated with professionals to provide networking opportunities.<br /><br />
                    Managed chapter administration, including meetings and member engagement.
                </>
            ),
        },
        {
            title: "Student Programmer",
            org: "University of Pennsylvania",
            date: "Jun 2021 – Aug 2021",
            description: (
                <>
                    Reduced portfolio risk by 15% through a program clustering stocks based on market reactions.<br /><br />
                    Utilized K-Means Clustering (KMC), Principal Component Analysis (PCA), and Normalization techniques.
                </>
            ),
        }
    ];

    const handleNextPage = () => {
        navigate('/Contact');
    };

    return (
        <div className="timeline-container">
            <h2>Experience</h2>
            <p className="scroll-prompt">Scroll to explore my professional journey</p>
            <div className="timeline">
                {events.map((event, index) => (
                    <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                        <div className="timeline-content">
                            <h3 className="timeline-title">{event.title}</h3>
                            <p className="timeline-org">{event.org}</p>
                            <p className="timeline-date">{event.date}</p>
                            <p className="timeline-description">{event.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className="next-page-button" onClick={handleNextPage}>
                Next Page
            </button>
        </div>
    );
};

export default Timeline;

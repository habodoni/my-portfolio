import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResumeTimeline.css';

const Timeline = () => {
    const navigate = useNavigate();

    // Ordered chronologically: most recent first
    const events = [
        {
            title: "Systems and DevOps Engineering Intern",
            org: "AT&T",
            date: "Jun 2025 – Aug 2025",
            description: (
                <>
                    Collaborated with System Engineers and vendors to configure and validate a lab environment emulating the production WAN using Juniper and Nokia hardware.<br /><br />
                    Executed IXIA test plans, supported certifications, and resolved technical issues in Ethernet and segment-routed deployments via DNOR.<br /><br />
                    Led a cross-functional team as Scrum Master in AT&T’s Intern Innovation Challenge, developing a social engineering threat detection app that achieved 90% accuracy by fine-tuning LLaMA 3.2 3B Instruct using Ollama and Unsloth; won 1st place in New Jersey, 3rd nationally.<br /><br />
                    Automated developer onboarding with containerized environments and SSH key provisioning using Python and Bash.
                </>
            ),
        },
        {
            title: "Software Engineering & AI Intern",
            org: "BGB Group – Innovation & Intelligence",
            date: "Mar 2025 – Jun 2025",
            description: (
                <>
                    Built an LLM-powered workflow in Jupyter using LangChain to extract and structure insights from PDF analyst reports, enabling simulation of HCP feedback for pharmaceutical messaging.<br /><br />
                    Integrated the system with Google Cloud services (BigQuery, Cloud Storage) to support scalable storage, querying, and analytics of insights across therapeutic areas.
                </>
            ),
        },
        {
            title: "Vice President",
            org: "INCOSE Stevens Chapter",
            date: "Jun 2024 – Current",
            description: (
                <>
                    Hosted events with former INCOSE Liberty Chapter presidents, drawing 20+ attendees per session.<br /><br />
                    Led chapter workshops promoting systems engineering and managed administration, meetings, and member engagement.
                </>
            ),
        },
        {
            title: "Regulatory Publishing Intern",
            org: "Regeneron Pharmaceuticals",
            date: "Summers 2023 & 2024",
            description: (
                <>
                    Developed standardized templates and automation routines, increasing FDA submission efficiency by 15% and reducing errors.<br /><br />
                    Enhanced submission accuracy by 10% using Veeva Vault RIM, Docubridge, and Adobe Acrobat DC in processing 200+ safety reports, submissions, and amendments.
                </>
            ),
        },
        {
            title: "Research Assistant",
            org: "Lab for Intelligent Integrated Networks of Engineering Systems (LIINES)",
            date: "Jan 2023 – Current",
            description: (
                <>
                    Co-developed a codebase improving data transfer efficiency by 50% through optimized binary data conversion.<br /><br />
                    Automated data processing of a 15,000+ page book of figures by building a scraping, visualization, and sorting tool for U.S. EIA datasets.<br /><br />
                    Verified laboratory data models via data scrubbing and statistical analysis.
                </>
            ),
        },
        {
            title: "Interactive Sensory Pad Engineer",
            org: "Independent Project",
            date: "2024",
            description: (
                <>
                    Developed an interactive sensory pad that improved a non-verbal child’s speech output by 20% within 4 weeks.<br /><br />
                    Engineered with ESP32, piezoelectric sensors, and DFPlayer Mini; programmed in C++ (Arduino IDE) to trigger customized audio playback.
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
                    Applied K-Means Clustering, PCA, and normalization techniques.
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
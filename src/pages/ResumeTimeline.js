import React from 'react';
import './ResumeTimeline.css';

const Timeline = () => {
    const events = [
        {
            title: "Regulatory Publishing Intern",
            org: "Regeneron Pharmaceuticals",
            date: "May 2023 - Aug 2024",
            description: "Streamlined FDA submission processes in Tarrytown, New York.",
        },
        {
            title: "Research Assistant",
            org: "Lab for Intelligent Integrated Networks of Engineering Systems",
            date: "Jan 2023 - Current",
            description: "Developed tools to automate data processing in Hoboken, New Jersey.",
        },
        {
            title: "Interactive Sensory Pad Engineer",
            org: "Independent Project",
            date: "Aug 2024",
            description: "Developed an interactive sensory pad for an autistic patient.",
        },
        {
            title: "Vice President",
            org: "INCOSE Stevens Chapter",
            date: "Jun 2024 - Current",
            description: "Led events and promoted systems engineering in Hoboken, New Jersey.",
        },
        {
            title: "Enrolled in Software Engineering",
            org: "Stevens Institute of Technology",
            date: "Sep 2022",
            description: "Pursuing Software Engineering with a GPA of 3.791.",
        },
        {
            title: "Student Programmer",
            org: "University of Pennsylvania",
            date: "Jun 2021 - Aug 2021",
            description: "Decreased risk in a stock portfolio using machine learning techniques.",
        }
    ];

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
        </div>
    );
};

export default Timeline;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ContactPage.css';

const ContactPage = () => {
    const navigate = useNavigate();

    return (
        <div className="contact-container">
            <h1 className="contact-title">Get in Touch</h1>
            <p className="contact-description">I'd love to hear from you! Fill out the form below, and I'll get back to you as soon as possible.</p>

            <form className="contact-form">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" placeholder="Your Name" />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="Your Email" />
                </div>
                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" placeholder="Your Message"></textarea>
                </div>
                <button type="submit" className="submit-button">Send Message</button>
            </form>

            <button className="home-button" onClick={() => navigate('/')}>Back to Home</button>
        </div>
    );
};

export default ContactPage;

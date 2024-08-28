import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './ContactPage.css';

const ContactPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [thankYouMessage, setThankYouMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            setErrorMessage('Please fill out all fields.');
            return;
        }

        try {
            await addDoc(collection(db, 'Contacts'), {
                Name: formData.name,
                Email: formData.email,
                Message: formData.message,
                timestamp: new Date()
            });

            setThankYouMessage('Thank you for getting in touch!');

            setFormData({
                name: '',
                email: '',
                message: ''
            });

            setTimeout(() => {
                setThankYouMessage('');
            }, 5000);

        } catch (error) {
            console.error('Error adding document: ', error);
        }
    };

    return (
        <div className="contact-container">
            <h1 className="contact-title">Get in Touch</h1>
            <p className="contact-description">I'd love to hear from you! Fill out the form below, and I'll get back to you as soon as possible.</p>

            <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        placeholder="Your Name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="Your Email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea 
                        id="message" 
                        name="message" 
                        placeholder="Your Message" 
                        value={formData.message} 
                        onChange={handleInputChange} 
                    />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="submit-button">Send Message</button>
            </form>

            {thankYouMessage && <p className="thank-you-message">{thankYouMessage}</p>}

            <button className="home-button" onClick={() => navigate('/')}>Back to Home</button>
        </div>
    );
};

export default ContactPage;

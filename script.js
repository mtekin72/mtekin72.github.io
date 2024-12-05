document.addEventListener('DOMContentLoaded', () => {
    // Initialize syntax highlighting
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });

    // Active navigation highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.7,
    };

    const observerCallback = (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const activeId = entry.target.id;
                navLinks.forEach((link) => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => observer.observe(section));

    // Animate stats when in view
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = parseInt(target.textContent);
                animateValue(target, 0, finalValue, 2000);
                statsObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => statsObserver.observe(stat));

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            obj.textContent = value + (obj.dataset.suffix || '+');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Form handling with validation and feedback
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            if (!validateForm(data)) {
                showNotification('Please fill out all fields correctly.', 'error');
                return;
            }

            // Simulate form submission
            try {
                showLoadingState(true);
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
                showNotification('Message sent successfully! I will get back to you soon.', 'success');
                this.reset();
            } catch (error) {
                showNotification('There was an error sending your message. Please try again.', 'error');
            } finally {
                showLoadingState(false);
            }
        });
    }

    function validateForm(data) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return data.name.trim() !== '' && 
               emailRegex.test(data.email) && 
               data.message.trim().length >= 10;
    }

    function showLoadingState(isLoading) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message';
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    background: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 1000;
                }
                
                .notification.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .notification.success {
                    background: #10B981;
                    color: white;
                }
                
                .notification.error {
                    background: #EF4444;
                    color: white;
                }
                
                .notification i {
                    font-size: 1.25rem;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Add scroll reveal animations
    const revealElements = document.querySelectorAll('.expertise-card, .portfolio-item, .article-card');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        revealObserver.observe(el);
    });

    // Add revealed class style
    const style = document.createElement('style');
    style.textContent = `
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // CV Builder Functionality
    const viewTemplatesBtn = document.querySelector('.view-templates-btn');
    const viewTipsBtn = document.querySelector('.view-tips-btn');
    const startBuildingBtn = document.querySelector('.start-building-btn');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const templatesModal = document.getElementById('templatesModal');
    const tipsModal = document.getElementById('tipsModal');
    const builderModal = document.getElementById('builderModal');

    // Modal Controls
    function openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    viewTemplatesBtn?.addEventListener('click', () => openModal(templatesModal));
    viewTipsBtn?.addEventListener('click', () => openModal(tipsModal));
    startBuildingBtn?.addEventListener('click', () => openModal(builderModal));

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modals.forEach(modal => closeModal(modal));
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // CV Builder Form Functionality
    const cvForm = document.getElementById('cvBuilderForm');
    const addSkillBtn = document.querySelector('.add-skill-btn');
    const skillsInput = document.querySelector('.skills-input input');
    const skillsTags = document.querySelector('.skills-tags');
    const addExperienceBtn = document.querySelector('.add-experience-btn');
    const experienceEntries = document.querySelector('.experience-entries');
    const addEducationBtn = document.querySelector('.add-education-btn');
    const educationEntries = document.querySelector('.education-entries');

    // Skills Management
    addSkillBtn?.addEventListener('click', () => {
        const skill = skillsInput.value.trim();
        if (skill) {
            addSkillTag(skill);
            skillsInput.value = '';
        }
    });

    function addSkillTag(skill) {
        const tag = document.createElement('div');
        tag.className = 'skill-tag';
        tag.innerHTML = `
            ${skill}
            <span class="remove-skill">&times;</span>
        `;
        
        tag.querySelector('.remove-skill').addEventListener('click', () => {
            tag.remove();
        });
        
        skillsTags.appendChild(tag);
    }

    // Experience Entry Management
    addExperienceBtn?.addEventListener('click', () => {
        const experienceEntry = document.createElement('div');
        experienceEntry.className = 'experience-entry form-section';
        experienceEntry.innerHTML = `
            <button type="button" class="remove-entry">&times;</button>
            <input type="text" placeholder="Company Name" required>
            <input type="text" placeholder="Position" required>
            <div class="date-range">
                <input type="month" placeholder="Start Date" required>
                <input type="month" placeholder="End Date">
                <label><input type="checkbox"> Current Position</label>
            </div>
            <textarea placeholder="Describe your testing responsibilities and achievements" rows="4" required></textarea>
        `;
        
        experienceEntry.querySelector('.remove-entry').addEventListener('click', () => {
            experienceEntry.remove();
        });
        
        experienceEntries.appendChild(experienceEntry);
    });

    // Education Entry Management
    addEducationBtn?.addEventListener('click', () => {
        const educationEntry = document.createElement('div');
        educationEntry.className = 'education-entry form-section';
        educationEntry.innerHTML = `
            <button type="button" class="remove-entry">&times;</button>
            <input type="text" placeholder="Institution/Certificate Name" required>
            <input type="text" placeholder="Degree/Certification" required>
            <div class="date-range">
                <input type="month" placeholder="Start Date" required>
                <input type="month" placeholder="End Date">
            </div>
            <textarea placeholder="Description (Optional)" rows="2"></textarea>
        `;
        
        educationEntry.querySelector('.remove-entry').addEventListener('click', () => {
            educationEntry.remove();
        });
        
        educationEntries.appendChild(educationEntry);
    });

    // CV Generation
    cvForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(cvForm);
        const skills = Array.from(skillsTags.children).map(tag => tag.textContent.trim());
        const experiences = Array.from(experienceEntries.children).map(entry => ({
            company: entry.querySelector('input[placeholder="Company Name"]').value,
            position: entry.querySelector('input[placeholder="Position"]').value,
            startDate: entry.querySelector('input[type="month"]:first-of-type').value,
            endDate: entry.querySelector('input[type="month"]:last-of-type').value,
            current: entry.querySelector('input[type="checkbox"]')?.checked,
            description: entry.querySelector('textarea').value
        }));
        const education = Array.from(educationEntries.children).map(entry => ({
            institution: entry.querySelector('input[placeholder="Institution/Certificate Name"]').value,
            degree: entry.querySelector('input[placeholder="Degree/Certification"]').value,
            startDate: entry.querySelector('input[type="month"]:first-of-type').value,
            endDate: entry.querySelector('input[type="month"]:last-of-type').value,
            description: entry.querySelector('textarea').value
        }));

        // Generate CV (you can customize this part based on your template)
        const cvData = {
            personalInfo: {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                location: formData.get('location')
            },
            summary: formData.get('summary'),
            skills,
            experiences,
            education
        };

        try {
            // Here you would typically send the data to a backend service
            // For now, we'll just show a success message
            showNotification('CV generated successfully! Download will start shortly.', 'success');
            // Simulate CV generation delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Generate and download CV (this is a placeholder)
            generateCV(cvData);
        } catch (error) {
            showNotification('Error generating CV. Please try again.', 'error');
        }
    });

    function generateCV(data) {
        // This is a placeholder function
        // In a real implementation, you would generate a PDF using a library like jsPDF
        // or send the data to a backend service that generates the PDF
        console.log('Generating CV with data:', data);
        showNotification('CV generation feature coming soon!', 'info');
    }
});

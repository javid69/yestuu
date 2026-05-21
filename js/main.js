(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });
    
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });

        $('#videoModal').on('shown.bs.modal', function (e) {
            var video = $("#video").get(0);
            if (video) {
                video.src = $videoSrc;
                video.play();
            }
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            var video = $("#video").get(0);
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        })
    });

    // Custom Property Image Lightbox with Dynamic Multi-Image Carousel
    $(document).ready(function () {
        // Create lightbox elements if they don't exist
        if ($('#propertyLightbox').length === 0) {
            $('body').append(`
                <div id="propertyLightbox" class="property-lightbox">
                    <span class="lightbox-close">&times;</span>
                    <div class="lightbox-content-wrapper">
                        <div id="lightboxCarousel" class="carousel slide w-100" data-bs-interval="false" style="max-width: 800px;">
                            <div class="carousel-inner text-center" id="lightboxCarouselInner">
                                <!-- Dynamic slides go here -->
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#lightboxCarousel" data-bs-slide="prev" style="width: 8%; opacity: 0.85;">
                                <span class="carousel-control-prev-icon" aria-hidden="true" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#lightboxCarousel" data-bs-slide="next" style="width: 8%; opacity: 0.85;">
                                <span class="carousel-control-next-icon" aria-hidden="true" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>
                        <div class="lightbox-caption">
                            <h4 id="lightboxTitle" class="lightbox-title"></h4>
                            <p id="lightboxDesc" class="lightbox-desc"></p>
                        </div>
                    </div>
                </div>
            `);
        }

        // Event delegation for property thumbnail click
        $(document).on('click', '.property-thumbnail', function () {
            var $img = $(this);
            var propertyId = $img.attr('data-id');
            var imgSrc = $img.attr('src');
            
            var $parentRow = $img.closest('.d-flex');
            var title = $parentRow.find('h5 span:first-child').text() || 'Asylen Ventures Signature Property';
            var desc = $parentRow.find('small').text() || 'Premium Turnkey Real Estate in Kashmir.';
            
            // Set caption
            $('#lightboxTitle').text(title);
            $('#lightboxDesc').text(desc);
            
            // Reset Carousel
            $('#lightboxCarouselInner').empty();
            
            if (propertyId) {
                // Fetch property gallery images
                fetch(`/api/properties/${propertyId}/gallery`)
                    .then(res => res.json())
                    .then(galleryImages => {
                        if (galleryImages && galleryImages.length > 0) {
                            galleryImages.forEach((img, idx) => {
                                const activeClass = idx === 0 ? 'active' : '';
                                $('#lightboxCarouselInner').append(`
                                    <div class="carousel-item ${activeClass}">
                                        <img class="lightbox-image d-block mx-auto" src="${img.image_url}" alt="Property image ${idx + 1}" style="max-height: 70vh; max-width: 100%; object-fit: contain;">
                                    </div>
                                `);
                            });
                            
                            if (galleryImages.length > 1) {
                                $('#propertyLightbox .carousel-control-prev, #propertyLightbox .carousel-control-next').show();
                            } else {
                                $('#propertyLightbox .carousel-control-prev, #propertyLightbox .carousel-control-next').hide();
                            }
                        } else {
                            // Fallback to main image
                            $('#lightboxCarouselInner').append(`
                                <div class="carousel-item active">
                                    <img class="lightbox-image d-block mx-auto" src="${imgSrc}" alt="${title}" style="max-height: 70vh; max-width: 100%; object-fit: contain;">
                                </div>
                            `);
                            $('#propertyLightbox .carousel-control-prev, #propertyLightbox .carousel-control-next').hide();
                        }
                    })
                    .catch(err => {
                        console.error('Error loading gallery images:', err);
                        // Fallback
                        $('#lightboxCarouselInner').html(`
                            <div class="carousel-item active">
                                <img class="lightbox-image d-block mx-auto" src="${imgSrc}" alt="${title}">
                            </div>
                        `);
                        $('#propertyLightbox .carousel-control-prev, #propertyLightbox .carousel-control-next').hide();
                    });
            } else {
                // Static element fallback
                $('#lightboxCarouselInner').append(`
                    <div class="carousel-item active">
                        <img class="lightbox-image d-block mx-auto" src="${imgSrc}" alt="${title}">
                    </div>
                `);
                $('#propertyLightbox .carousel-control-prev, #propertyLightbox .carousel-control-next').hide();
            }
            
            $('#propertyLightbox').addClass('active');
            $('body').addClass('lightbox-open');
        });

        // Close lightbox
        $('#propertyLightbox, .lightbox-close').click(function (e) {
            if ($(e.target).hasClass('property-lightbox') || $(e.target).hasClass('lightbox-close') || $(e.target).hasClass('lightbox-content-wrapper')) {
                $('#propertyLightbox').removeClass('active');
                $('body').removeClass('lightbox-open');
            }
        });

        // Close on ESC
        $(document).keyup(function (e) {
            if (e.key === "Escape") {
                $('#propertyLightbox').removeClass('active');
                $('body').removeClass('lightbox-open');
            }
        });
    });

    // Dynamic Property Loading for Home & Menu pages
    $(document).ready(function () {
        const aptsContainer = $('#apartments-container');
        const villasContainer = $('#villas-container');
        const plotsContainer = $('#plots-container');

        if (aptsContainer.length || villasContainer.length || plotsContainer.length) {
            if (window.location.protocol !== 'file:') {
                fetch('/api/properties')
                    .then(res => res.json())
                    .then(properties => {
                        if (aptsContainer.length) aptsContainer.empty();
                        if (villasContainer.length) villasContainer.empty();
                        if (plotsContainer.length) plotsContainer.empty();

                        properties.forEach((p, index) => {
                            const imgUrl = p.image_url || 'img/villa_exterior_both.png';
                            const cardHtml = `
                                <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
                                    <div class="d-flex align-items-center">
                                        <img class="flex-shrink-0 img-fluid rounded property-thumbnail" src="${imgUrl}" alt="${p.title}" style="width: 160px; height: 160px; object-fit: cover; cursor: pointer;" data-id="${p.id}">
                                        <div class="w-100 d-flex flex-column text-start ps-4">
                                            <h5 class="d-flex justify-content-between border-bottom pb-2">
                                                <span>${p.title}</span>
                                                <span class="text-primary">${p.price || 'Enquire'}</span>
                                            </h5>
                                            <small class="fst-italic">${p.description || ''}</small>
                                        </div>
                                    </div>
                                </div>
                            `;

                            if (p.category === 'Apartment' && aptsContainer.length) {
                                aptsContainer.append(cardHtml);
                            } else if (p.category === 'Villa' && villasContainer.length) {
                                villasContainer.append(cardHtml);
                            } else if (p.category === 'Plot' && plotsContainer.length) {
                                plotsContainer.append(cardHtml);
                            }
                        });
                    })
                    .catch(err => console.error('Error fetching properties dynamically:', err));
            }
        }
    });

    // Global Site Settings Loader
    $(document).ready(function() {
        if (window.location.protocol !== 'file:') {
            fetch('/api/settings')
                .then(res => {
                    if (!res.ok) throw new Error('Settings fetch failed');
                    return res.json();
                })
                .then(settings => {
                    // Hero details
                    if (settings.hero_title) $('#dyn_hero_title').text(settings.hero_title);
                    if (settings.hero_subtitle) $('#dyn_hero_subtitle').text(settings.hero_subtitle);
                    if (settings.hero_button_text) $('#dyn_hero_button_text').text(settings.hero_button_text);
                    
                    if (settings.hero_video_url) {
                        $('#heroVideoSource').attr('src', settings.hero_video_url);
                        const videoPlayer = document.getElementById('heroVideoPlayer');
                        if (videoPlayer) videoPlayer.load();
                    }
                    
                    // About details
                    if (settings.about_title) $('#dyn_about_title').text(settings.about_title);
                    const aboutHeadingEl = $('#dyn_about_heading');
                    if (settings.about_heading && aboutHeadingEl.length) {
                        aboutHeadingEl.html(settings.about_heading.includes('<i') ? settings.about_heading : `Welcome to <i class="fa fa-home text-primary me-2"></i>${settings.about_heading}`);
                    }
                    if (settings.about_desc1) $('#dyn_about_desc1').text(settings.about_desc1);
                    if (settings.about_desc2) $('#dyn_about_desc2').text(settings.about_desc2);
                    
                    if (settings.about_experience_years) $('#dyn_about_experience_years').text(settings.about_experience_years);
                    if (settings.about_homeowners_count) $('#dyn_about_homeowners_count').text(settings.about_homeowners_count);
                    
                    if (settings.about_img1) $('#dyn_about_img1').attr('src', settings.about_img1);
                    if (settings.about_img2) $('#dyn_about_img2').attr('src', settings.about_img2);
                    if (settings.about_img3) $('#dyn_about_img3').attr('src', settings.about_img3);
                    if (settings.about_img4) $('#dyn_about_img4').attr('src', settings.about_img4);

                    // Signature Showcase
                    if (settings.sig_title) $('#dyn_showcase_title').text(settings.sig_title);
                    if (settings.sig_heading) $('#dyn_showcase_heading').text(settings.sig_heading);
                    
                    if (settings.sig_estate1_title) $('#dyn_showcase_prop1_title').text(settings.sig_estate1_title);
                    if (settings.sig_estate1_desc) $('#dyn_showcase_prop1_desc').text(settings.sig_estate1_desc);
                    if (settings.sig_estate1_tag) $('#dyn_showcase_prop1_tag').text(settings.sig_estate1_tag);
                    if (settings.sig_estate1_img) $('#dyn_showcase_prop1_img').attr('src', settings.sig_estate1_img);
                    
                    if (settings.sig_estate2_title) $('#dyn_showcase_prop2_title').text(settings.sig_estate2_title);
                    if (settings.sig_estate2_desc) $('#dyn_showcase_prop2_desc').text(settings.sig_estate2_desc);
                    if (settings.sig_estate2_tag) $('#dyn_showcase_prop2_tag').text(settings.sig_estate2_tag);
                    if (settings.sig_estate2_img) $('#dyn_showcase_prop2_img').attr('src', settings.sig_estate2_img);
                    
                    if (settings.sig_estate3_title) $('#dyn_showcase_prop3_title').text(settings.sig_estate3_title);
                    if (settings.sig_estate3_desc) $('#dyn_showcase_prop3_desc').text(settings.sig_estate3_desc);
                    if (settings.sig_estate3_tag) $('#dyn_showcase_prop3_tag').text(settings.sig_estate3_tag);
                    if (settings.sig_estate3_img) $('#dyn_showcase_prop3_img').attr('src', settings.sig_estate3_img);
                    
                    if (settings.sig_artistry_title) $('#dyn_showcase_extra_heading').text(settings.sig_artistry_title);
                    if (settings.sig_artistry_img) $('#dyn_showcase_extra_img').attr('src', settings.sig_artistry_img);
                    if (settings.sig_artistry_desc1) $('#dyn_showcase_extra_desc1').text(settings.sig_artistry_desc1);
                    if (settings.sig_artistry_desc2) $('#dyn_showcase_extra_desc2').text(settings.sig_artistry_desc2);
                    
                    if (settings.sig_artistry_sub_img) $('#dyn_showcase_extra_panel_img').attr('src', settings.sig_artistry_sub_img);
                    if (settings.sig_artistry_sub_title) $('#dyn_showcase_extra_panel_title').text(settings.sig_artistry_sub_title);
                    if (settings.sig_artistry_sub_tag) $('#dyn_showcase_extra_panel_desc').text(settings.sig_artistry_sub_tag);
                    
                    // Testimonials
                    if (settings.test_title) $('#dyn_testimonial_title').text(settings.test_title);
                    if (settings.test_heading) $('#dyn_testimonial_heading').text(settings.test_heading);
                    
                    if (settings.test1_name) $('#dyn_testimonial_user1_name').text(settings.test1_name);
                    if (settings.test1_title) $('#dyn_testimonial_user1_role').text(settings.test1_title);
                    if (settings.test1_desc) $('#dyn_testimonial_user1_feedback').text(settings.test1_desc);
                    if (settings.test1_img) $('#dyn_testimonial_user1_img').attr('src', settings.test1_img);
                    
                    if (settings.test2_name) $('#dyn_testimonial_user2_name').text(settings.test2_name);
                    if (settings.test2_title) $('#dyn_testimonial_user2_role').text(settings.test2_title);
                    if (settings.test2_desc) $('#dyn_testimonial_user2_feedback').text(settings.test2_desc);
                    if (settings.test2_img) $('#dyn_testimonial_user2_img').attr('src', settings.test2_img);
                    
                    if (settings.test3_name) $('#dyn_testimonial_user3_name').text(settings.test3_name);
                    if (settings.test3_title) $('#dyn_testimonial_user3_role').text(settings.test3_title);
                    if (settings.test3_desc) $('#dyn_testimonial_user3_feedback').text(settings.test3_desc);
                    if (settings.test3_img) $('#dyn_testimonial_user3_img').attr('src', settings.test3_img);
                    
                    if (settings.test4_name) $('#dyn_testimonial_user4_name').text(settings.test4_name);
                    if (settings.test4_title) $('#dyn_testimonial_user4_role').text(settings.test4_title);
                    if (settings.test4_desc) $('#dyn_testimonial_user4_feedback').text(settings.test4_desc);
                    if (settings.test4_img) $('#dyn_testimonial_user4_img').attr('src', settings.test4_img);
                    
                    // Footer details
                    if (settings.contact_address) $('#dyn_footer_address').html(`<i class="fa fa-map-marker-alt me-3"></i>${settings.contact_address}`);
                    if (settings.contact_phone) $('#dyn_footer_phone').html(`<i class="fa fa-phone-alt me-3"></i>${settings.contact_phone}`);
                    if (settings.contact_email) $('#dyn_footer_email').html(`<i class="fa fa-envelope me-3"></i>${settings.contact_email}`);
                    
                    if (settings.contact_hours_weekdays) $('#dyn_footer_hours_weekdays').text(settings.contact_hours_weekdays);
                    if (settings.contact_hours_sunday) $('#dyn_footer_hours_sunday').text(settings.contact_hours_sunday);
                })
                .catch(err => console.error('Error applying dynamic settings globally:', err));

            // Load Dynamic Social Links
            fetch('/api/social-links')
                .then(res => res.json())
                .then(links => {
                    const socialContainer = $('.btn-social').parent();
                    if (socialContainer.length) {
                        socialContainer.empty();
                        links.forEach(link => {
                            socialContainer.append(`
                                <a class="btn btn-outline-light btn-social" href="${link.url}" target="_blank">
                                    <i class="${link.icon_class}"></i>
                                </a>
                            `);
                        });
                    }
                })
                .catch(err => console.error('Error loading dynamic social links:', err));

            // Load Active Map Location
            fetch('/api/map-locations')
                .then(res => res.json())
                .then(locations => {
                    const activeLoc = locations.find(loc => loc.is_active === 1);
                    if (activeLoc && $('#dyn_contact_map').length) {
                        // Convert any iframe wrapper copy-paste code to just source if needed, 
                        // or set direct source. Since we specify in instructions to copy the src, 
                        // setting the src attribute is correct.
                        $('#dyn_contact_map').attr('src', activeLoc.map_url);
                    }
                })
                .catch(err => console.error('Error loading active map location:', err));
        }
    });

    // ==========================================================================
    // Interactive Luxury Real Estate Enquiry & Pre-fill System
    // ==========================================================================
    $(document).ready(function() {
        // 1. Global event delegation for Enquire buttons
        $(document).on('click', 'h5.d-flex.justify-content-between span.text-primary', function() {
            const propertyTitle = $(this).siblings('span').first().text().trim();
            
            // Heuristic category classifier (1 = Apartment, 2 = Villa, 3 = Plot)
            let categoryVal = "1";
            
            const closestTab = $(this).closest('.tab-pane');
            const idAttr = closestTab.attr('id') || '';
            
            if (idAttr === 'tab-1' || $(this).closest('#apartments-container').length > 0) {
                categoryVal = "1";
            } else if (idAttr === 'tab-2' || $(this).closest('#villas-container').length > 0) {
                categoryVal = "2";
            } else if (idAttr === 'tab-3' || $(this).closest('#plots-container').length > 0) {
                categoryVal = "3";
            } else {
                // Heuristic fallback based on Title & Description text
                const titleText = propertyTitle.toLowerCase();
                const descText = $(this).closest('.d-flex').find('small').text().toLowerCase();
                const combinedText = titleText + " " + descText;
                
                if (combinedText.includes('plot') || combinedText.includes('land')) {
                    categoryVal = "3";
                } else if (combinedText.includes('villa') || combinedText.includes('estate') || combinedText.includes('home') || combinedText.includes('residence') || combinedText.includes('cottage')) {
                    categoryVal = "2";
                } else if (combinedText.includes('apartment') || combinedText.includes('duplex') || combinedText.includes('flat')) {
                    categoryVal = "1";
                }
            }
            
            const bookingForm = $('#bookingForm');
            if (bookingForm.length > 0) {
                // If the booking form exists on the current page, pre-fill and scroll
                $('#select1').val(categoryVal);
                $('#message').val("Interested in: " + propertyTitle + ". Please provide more details.");
                
                const bookingSection = document.getElementById('booking-section');
                if (bookingSection) {
                    bookingSection.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Focus the name field with a transition delay for smooth UX
                setTimeout(function() {
                    $('#name').focus();
                }, 600);
            } else {
                // Otherwise, redirect to booking.html with parameters
                const redirectUrl = `booking.html?property=${encodeURIComponent(propertyTitle)}&category=${encodeURIComponent(categoryVal)}`;
                window.location.href = redirectUrl;
            }
        });
        
        // 2. Parse query parameters on load to pre-fill booking form (if present)
        const urlParams = new URLSearchParams(window.location.search);
        const propertyParam = urlParams.get('property');
        const categoryParam = urlParams.get('category');
        
        if (propertyParam && $('#bookingForm').length > 0) {
            if (categoryParam) {
                $('#select1').val(categoryParam);
            }
            $('#message').val("Interested in: " + propertyParam + ". Please provide more details.");
            
            // Smoothly scroll to the booking section after rendering
            setTimeout(function() {
                const bookingSection = document.getElementById('booking-section');
                if (bookingSection) {
                    bookingSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
            
            // Auto-focus the name field
            setTimeout(function() {
                $('#name').focus();
            }, 900);
        }

        // 3. Footer Newsletter Subscription
        const newsletterInput = $('.footer input[placeholder="Your email"]');
        if (newsletterInput.length > 0) {
            const newsletterButton = newsletterInput.siblings('button');
            const newsletterContainer = newsletterInput.parent();

            // Set input type to email for mobile device keyboard support and semantic validity
            newsletterInput.attr('type', 'email');

            function submitNewsletter() {
                const email = newsletterInput.val().trim();
                const originalText = newsletterButton.text();

                // Remove existing messages
                newsletterContainer.parent().find('.newsletter-msg').remove();

                if (window.location.protocol === 'file:') {
                    showMsg('Form submissions are disabled when running via file:// directly. Please open <a href="http://localhost:5500" style="color: #842029; text-decoration: underline;">http://localhost:5500</a> to signup.', false);
                    return;
                }

                if (!email) {
                    showMsg('Email address is required.', false);
                    return;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showMsg('Please enter a valid email address.', false);
                    return;
                }

                newsletterButton.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

                fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                })
                .then(res => {
                    const isSuccess = res.status === 201;
                    return res.json()
                        .then(data => {
                            showMsg(data.message || data.error, isSuccess);
                            if (isSuccess) {
                                newsletterInput.val('');
                            }
                        })
                        .catch(() => {
                            if (res.status === 404) {
                                showMsg('API endpoint not found (404). Please restart your Node server in the terminal to load the new routes.', false);
                            } else {
                                showMsg(`Server error (status ${res.status}).`, false);
                            }
                        });
                })
                .catch(err => {
                    console.error('Newsletter submission error:', err);
                    showMsg('Connection error. Please check if your Node server is running.', false);
                })
                .finally(() => {
                    newsletterButton.prop('disabled', false).text(originalText);
                });
            }

            function showMsg(text, isSuccess) {
                const alertClass = isSuccess ? 'alert-success' : 'alert-danger';
                const msgHtml = `
                    <div class="alert ${alertClass} p-2 mt-2 text-center newsletter-msg" style="font-size: 0.85rem; border-radius: 4px; animation: fadeIn 0.3s ease; width: 100%;">
                        ${text}
                    </div>
                `;
                newsletterContainer.after(msgHtml);

                // Auto-fade out after 4 seconds
                setTimeout(() => {
                    newsletterContainer.parent().find('.newsletter-msg').fadeOut(500, function() {
                        $(this).remove();
                    });
                }, 4000);
            }

            // Click listener
            newsletterButton.click(function(e) {
                e.preventDefault();
                submitNewsletter();
            });

            // Enter keypress listener
            newsletterInput.keypress(function(e) {
                if (e.which === 13) {
                    e.preventDefault();
                    submitNewsletter();
                }
            });
        }
    });

})(jQuery);


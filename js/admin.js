$(document).ready(function() {
    // Check if loaded via file:// protocol
    if (window.location.protocol === 'file:') {
        window.location.href = 'admin-login.html';
        return;
    }

    // 1. Session Verification
    function checkSession() {
        return fetch('/api/admin/me')
            .then(res => {
                if (res.status !== 200) {
                    window.location.href = 'admin-login.html';
                    throw new Error('Not authenticated');
                }
                return res.json();
            });
    }

    checkSession()
        .then(user => {
            initDashboard();
        })
        .catch(err => {
            console.log('Session redirect active');
        });

    // 2. Main Dashboard Initializer
    function initDashboard() {
        // Load counts and stats
        loadOverviewStats();
        // Load data tables
        loadBookings();
        loadMessages();
        loadProperties();
        loadSettings();

        // Bind navigation clicks
        $('.sidebar-menu .menu-item').click(function(e) {
            e.preventDefault();
            const section = $(this).data('section');
            switchSection(section);
        });

        // "View All" links in dashboard card headers
        $('.view-all-link').click(function(e) {
            e.preventDefault();
            const section = $(this).data('section');
            switchSection(section);
        });

        // Bind logout click
        $('#logoutBtn').click(function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to sign out?')) {
                fetch('/api/admin/logout', { method: 'POST' })
                    .then(() => {
                        window.location.href = 'admin-login.html';
                    });
            }
        });

        // Properties Save Form submit handler
        $('#propertyForm').submit(function(e) {
            e.preventDefault();
            saveProperty();
        });

        // Property Add button reset form fields
        $('#addPropertyBtn').click(function() {
            $('#propertyForm')[0].reset();
            $('#propId').val('');
            $('#propertyModalLabel').text('Add Property');
            $('#galleryManagerSection').addClass('d-none'); // Hide gallery for new properties
        });

        // Settings Save click handler
        $('#saveSettingsBtn').click(function(e) {
            e.preventDefault();
            const form = $('#settingsForm')[0];
            if (form && !form.checkValidity()) {
                form.reportValidity();
                return;
            }
            saveSettings();
        });

        // Social Link Form submit handler
        $('#socialForm').submit(function(e) {
            e.preventDefault();
            saveSocialLink();
        });

        // Social Link Add button reset
        $('#addSocialBtn').click(function() {
            $('#socialForm')[0].reset();
            $('#socialId').val('');
            $('#socialModalLabel').text('Add Social Link');
        });

        // Map Location Form submit handler
        $('#mapForm').submit(function(e) {
            e.preventDefault();
            saveMapLocation();
        });

        // Map Location Add button reset
        $('#addMapBtn').click(function() {
            $('#mapForm')[0].reset();
            $('#mapId').val('');
            $('#mapIsActive').prop('checked', false);
            $('#mapModalLabel').text('Add Map Location');
        });

        // File Upload Handlers
        $(document).on('click', '.btn-upload-media', function() {
            $(this).siblings('.media-upload-input').click();
        });

        $(document).on('change', '.media-upload-input', function() {
            const fileInput = this;
            const file = fileInput.files[0];
            if (!file) return;

            const targetInputId = $(fileInput).data('target');
            const uploadBtn = $(fileInput).siblings('.btn-upload-media');
            const originalBtnHtml = uploadBtn.html();

            // Disable button and show spinner
            uploadBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>...');

            const formData = new FormData();
            formData.append('file', file);

            fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else if (res.status === 401 || res.status === 403) {
                    throw new Error('Unauthorized. Please log in again.');
                } else {
                    throw new Error('Upload failed.');
                }
            })
            .then(data => {
                // Populate path back to field
                $(`#${targetInputId}`).val(data.url);
                uploadBtn.prop('disabled', false).html('<i class="fas fa-check"></i> Done');
                setTimeout(() => {
                    uploadBtn.html(originalBtnHtml);
                }, 2000);
            })
            .catch(err => {
                console.error('Upload error:', err);
                alert(err.message || 'Error uploading file.');
                uploadBtn.prop('disabled', false).html(originalBtnHtml);
            });
        });

        // Mobile sidebar toggle handlers
        $('#sidebarToggle').click(function() {
            $('body').toggleClass('sidebar-open');
        });

        $('#sidebarOverlay').click(function() {
            $('body').removeClass('sidebar-open');
        });

        // Close sidebar on link click (for mobile viewports)
        $('.sidebar-menu .menu-item a').click(function() {
            if ($(window).width() < 992) {
                $('body').removeClass('sidebar-open');
            }
        });
    }

    // Switch active navigation panel
    function switchSection(sectionId) {
        // Toggle Sidebar Active state
        $('.sidebar-menu .menu-item').removeClass('active');
        $(`.sidebar-menu .menu-item[data-section="${sectionId}"]`).addClass('active');

        // Toggle Section Display
        $('.dashboard-section').removeClass('active');
        $(`#section-${sectionId}`).addClass('active');

        // Load data dynamically based on active section
        if (sectionId === 'social-links') {
            loadSocialLinks();
        } else if (sectionId === 'map-locations') {
            loadMapLocations();
        }
    }

    // 3. overview section handlers
    function loadOverviewStats() {
        // Fetch stats counts from properties, bookings, messages API
        Promise.all([
            fetch('/api/properties').then(res => res.json()),
            fetch('/api/bookings').then(res => res.json()),
            fetch('/api/messages').then(res => res.json())
        ])
        .then(([properties, bookings, messages]) => {
            // Count metrics
            $('#stat-properties-count').text(properties.length);
            $('#stat-bookings-count').text(bookings.length);
            
            const unreadCount = messages.filter(m => m.status === 'Unread').length;
            $('#stat-messages-count').text(unreadCount);

            // Populate Overview Previews
            populateOverviewPreviews(bookings, messages);
        })
        .catch(err => console.error('Error fetching statistics:', err));
    }

    function populateOverviewPreviews(bookings, messages) {
        // Show up to 5 recent bookings
        const recentBookings = bookings.slice(0, 5);
        const bookingList = $('#recent-bookings-list');
        bookingList.empty();

        if (recentBookings.length === 0) {
            bookingList.append('<tr><td colspan="3" class="text-center text-muted">No bookings found</td></tr>');
        } else {
            recentBookings.forEach(b => {
                const statusBadge = getBookingBadge(b.status);
                bookingList.append(`
                    <tr>
                        <td class="fw-bold">${b.name}</td>
                        <td>${b.property_interest}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `);
            });
        }

        // Show up to 5 recent messages
        const recentMessages = messages.slice(0, 5);
        const msgList = $('#recent-messages-list');
        msgList.empty();

        if (recentMessages.length === 0) {
            msgList.append('<tr><td colspan="3" class="text-center text-muted">No messages found</td></tr>');
        } else {
            recentMessages.forEach(m => {
                const statusBadge = getMessageBadge(m.status);
                msgList.append(`
                    <tr>
                        <td class="fw-bold">${m.name}</td>
                        <td>${m.subject}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `);
            });
        }
    }

    function getBookingBadge(status) {
        if (status === 'Confirmed') return '<span class="badge-confirmed">Confirmed</span>';
        if (status === 'Cancelled') return '<span class="badge-cancelled">Cancelled</span>';
        return '<span class="badge-pending">Pending</span>';
    }

    function getMessageBadge(status) {
        if (status === 'Read') return '<span class="badge-read">Read</span>';
        return '<span class="badge-unread">Unread</span>';
    }

    // 4. Booking manager handlers
    function loadBookings() {
        fetch('/api/bookings')
            .then(res => res.json())
            .then(bookings => {
                const tbody = $('#bookings-table-body');
                tbody.empty();

                if (bookings.length === 0) {
                    tbody.append('<tr><td colspan="8" class="text-center text-muted">No bookings scheduled yet</td></tr>');
                    return;
                }

                bookings.forEach(b => {
                    const statusBadge = getBookingBadge(b.status);
                    tbody.append(`
                        <tr>
                            <td class="fw-bold">#${b.id}</td>
                            <td>${b.name}</td>
                            <td><a href="mailto:${b.email}">${b.email}</a></td>
                            <td>${b.datetime}</td>
                            <td>${b.property_interest}</td>
                            <td><small>${b.message || '-'}</small></td>
                            <td>${statusBadge}</td>
                            <td>
                                <button class="btn-action btn-action-confirm confirm-booking-btn" data-id="${b.id}" title="Confirm Appointment">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn-action btn-action-cancel cancel-booking-btn" data-id="${b.id}" title="Cancel Appointment">
                                    <i class="fas fa-times"></i>
                                </button>
                                <button class="btn-action btn-action-delete delete-booking-btn" data-id="${b.id}" title="Delete Booking">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `);
                });

                // Attach button event listeners
                $('.confirm-booking-btn').click(function() {
                    updateBookingStatus($(this).data('id'), 'Confirmed');
                });
                $('.cancel-booking-btn').click(function() {
                    updateBookingStatus($(this).data('id'), 'Cancelled');
                });
                $('.delete-booking-btn').click(function() {
                    deleteBooking($(this).data('id'));
                });
            })
            .catch(err => console.error('Error loading bookings:', err));
    }

    function updateBookingStatus(id, status) {
        fetch(`/api/bookings/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        })
        .then(res => {
            if (res.status === 200) {
                loadBookings();
                loadOverviewStats();
            } else {
                alert('Failed to update booking status.');
            }
        });
    }

    function deleteBooking(id) {
        if (confirm(`Are you sure you want to delete Booking #${id}?`)) {
            fetch(`/api/bookings/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.status === 200) {
                        loadBookings();
                        loadOverviewStats();
                    } else {
                        alert('Failed to delete booking.');
                    }
                });
        }
    }

    // 5. Message manager handlers
    function loadMessages() {
        fetch('/api/messages')
            .then(res => res.json())
            .then(messages => {
                const tbody = $('#messages-table-body');
                tbody.empty();

                if (messages.length === 0) {
                    tbody.append('<tr><td colspan="7" class="text-center text-muted">No messages received yet</td></tr>');
                    return;
                }

                messages.forEach(m => {
                    const statusBadge = getMessageBadge(m.status);
                    tbody.append(`
                        <tr>
                            <td class="fw-bold">#${m.id}</td>
                            <td>${m.name}</td>
                            <td><a href="mailto:${m.email}">${m.email}</a></td>
                            <td>${m.subject}</td>
                            <td><small>${m.message}</small></td>
                            <td>${statusBadge}</td>
                            <td>
                                ${m.status === 'Unread' ? `
                                <button class="btn-action btn-action-read read-message-btn" data-id="${m.id}" title="Mark as Read">
                                    <i class="fas fa-envelope-open"></i>
                                </button>` : ''}
                                <button class="btn-action btn-action-delete delete-message-btn" data-id="${m.id}" title="Delete Message">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `);
                });

                $('.read-message-btn').click(function() {
                    markMessageAsRead($(this).data('id'));
                });
                $('.delete-message-btn').click(function() {
                    deleteMessage($(this).data('id'));
                });
            })
            .catch(err => console.error('Error loading messages:', err));
    }

    function markMessageAsRead(id) {
        fetch(`/api/messages/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Read' })
        })
        .then(res => {
            if (res.status === 200) {
                loadMessages();
                loadOverviewStats();
            } else {
                alert('Failed to update message status.');
            }
        });
    }

    function deleteMessage(id) {
        if (confirm(`Are you sure you want to delete Message #${id}?`)) {
            fetch(`/api/messages/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.status === 200) {
                        loadMessages();
                        loadOverviewStats();
                    } else {
                        alert('Failed to delete message.');
                    }
                });
        }
    }

    // 6. Property manager CRUD handlers
    function loadProperties() {
        fetch('/api/properties')
            .then(res => res.json())
            .then(properties => {
                const tbody = $('#properties-table-body');
                tbody.empty();

                if (properties.length === 0) {
                    tbody.append('<tr><td colspan="6" class="text-center text-muted">No properties in portfolio</td></tr>');
                    return;
                }

                properties.forEach(p => {
                    const imgUrl = p.image_url || 'img/villa_exterior_both.png';
                    tbody.append(`
                        <tr>
                            <td>
                                <img src="${imgUrl}" class="property-row-img" alt="${p.title}">
                            </td>
                            <td class="fw-bold">${p.title}</td>
                            <td><span class="badge bg-secondary">${p.category}</span></td>
                            <td class="text-primary fw-bold">${p.price}</td>
                            <td><small>${p.description || '-'}</small></td>
                            <td>
                                <button class="btn-action btn-action-edit edit-property-btn" data-id="${p.id}" title="Edit Property">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-action btn-action-delete delete-property-btn" data-id="${p.id}" title="Delete Property">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `);
                });

                // Bind click events
                $('.edit-property-btn').click(function() {
                    openEditPropertyModal($(this).data('id'));
                });
                $('.delete-property-btn').click(function() {
                    deleteProperty($(this).data('id'));
                });
            })
            .catch(err => console.error('Error loading properties:', err));
    }

    function openEditPropertyModal(id) {
        // Fetch single property details
        fetch(`/api/properties/${id}`)
            .then(res => res.json())
            .then(p => {
                $('#propId').val(p.id);
                $('#propTitle').val(p.title);
                $('#propCategory').val(p.category);
                $('#propPrice').val(p.price);
                $('#propImageUrl').val(p.image_url || '');
                $('#propDescription').val(p.description || '');

                $('#propertyModalLabel').text('Edit Property');
                
                // Set up gallery management
                $('#galleryManagerSection').removeClass('d-none');
                loadGallery(p.id);

                // Show modal programmatically using Bootstrap API
                const myModal = new bootstrap.Modal(document.getElementById('propertyModal'));
                myModal.show();
            })
            .catch(err => console.error('Error fetching property info:', err));
    }

    function saveProperty() {
        const id = $('#propId').val();
        const propertyData = {
            title: $('#propTitle').val(),
            category: $('#propCategory').val(),
            price: $('#propPrice').val(),
            image_url: $('#propImageUrl').val(),
            description: $('#propDescription').val()
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/properties/${id}` : '/api/properties';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(propertyData)
        })
        .then(res => {
            if (res.status === 200 || res.status === 201) {
                // Dismiss modal
                const modalEl = document.getElementById('propertyModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                    $('#propertyModal').modal('hide');
                }

                loadProperties();
                loadOverviewStats();
            } else {
                alert('Failed to save property. Please check your data.');
            }
        })
        .catch(err => {
            console.error('Error saving property:', err);
            alert('Server error saving property.');
        });
    }

    function deleteProperty(id) {
        if (confirm(`Are you sure you want to delete this property?`)) {
            fetch(`/api/properties/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.status === 200) {
                        loadProperties();
                        loadOverviewStats();
                    } else {
                        alert('Failed to delete property.');
                    }
                });
        }
    }

    // 7. Property Gallery Management
    function loadGallery(propertyId) {
        fetch(`/api/properties/${propertyId}/gallery`)
            .then(res => res.json())
            .then(rows => {
                const list = $('#galleryList');
                list.empty();

                if (!rows || rows.length === 0) {
                    list.append('<div class="col-12 text-muted text-center py-2">No gallery images added yet.</div>');
                } else {
                    rows.forEach(img => {
                        list.append(`
                            <div class="col-md-3 position-relative mb-2" style="height: 80px;">
                                <img src="${img.image_url}" class="w-100 h-100 rounded" style="object-fit: cover; border: 1px solid #E2E8F0;">
                                <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 p-1 m-1 delete-gallery-img-btn" data-id="${img.id}" style="line-height: 1; border-radius: 4px;">
                                    <i class="fas fa-trash-alt" style="font-size: 0.8rem;"></i>
                                </button>
                            </div>
                        `);
                    });

                    // Bind delete buttons
                    $('.delete-gallery-img-btn').click(function() {
                        deleteGalleryImage($(this).data('id'), propertyId);
                    });
                }
            })
            .catch(err => console.error('Error loading gallery:', err));

        // Re-bind add button click handler to prevent duplicates
        $('#addGalleryImageBtn').off('click').click(function() {
            const urlVal = $('#newGalleryImageUrl').val().trim();
            if (!urlVal) return;

            fetch(`/api/properties/${propertyId}/gallery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: urlVal })
            })
            .then(res => {
                if (res.status === 201) {
                    $('#newGalleryImageUrl').val('');
                    loadGallery(propertyId);
                } else {
                    alert('Failed to add gallery image.');
                }
            })
            .catch(err => console.error('Error adding gallery image:', err));
        });
    }

    function deleteGalleryImage(galleryId, propertyId) {
        if (confirm('Are you sure you want to delete this gallery image?')) {
            fetch(`/api/properties/gallery/${galleryId}`, { method: 'DELETE' })
                .then(res => {
                    if (res.status === 200) {
                        loadGallery(propertyId);
                    } else {
                        alert('Failed to delete gallery image.');
                    }
                })
                .catch(err => console.error('Error deleting gallery image:', err));
        }
    }

    // 8. Site Settings (CMS) Management
    function loadSettings() {
        fetch('/api/settings')
            .then(res => res.json())
            .then(settings => {
                // Populate all fields dynamically based on settings keys
                for (const [key, value] of Object.entries(settings)) {
                    const el = $(`#set_${key}`);
                    if (el.length > 0) {
                        el.val(value);
                    }
                }
            })
            .catch(err => console.error('Error loading settings:', err));
    }

    function saveSettings() {
        const payload = {};
        // Find all inputs starting with set_ and build the payload keys
        $('#settingsForm input, #settingsForm textarea').each(function() {
            const id = $(this).attr('id');
            if (id && id.startsWith('set_') && $(this).attr('type') !== 'file') {
                const key = id.replace('set_', '');
                payload[key] = $(this).val();
            }
        });

        const statusDiv = $('#settingsStatus');
        statusDiv.addClass('d-none').removeClass('alert-success alert-danger');

        fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (res.status === 200) {
                statusDiv.removeClass('d-none').addClass('alert-success').text('Site settings saved and updated successfully!');
                setTimeout(() => statusDiv.addClass('d-none'), 5000);
            } else {
                statusDiv.removeClass('d-none').addClass('alert-danger').text('Failed to save settings. Please try again.');
            }
        })
        .catch(err => {
            console.error('Error saving settings:', err);
            statusDiv.removeClass('d-none').addClass('alert-danger').text('Server error saving settings.');
        });
    }

    // ==========================================
    // 9. Social Links Management
    // ==========================================
    function loadSocialLinks() {
        fetch('/api/social-links')
            .then(res => res.json())
            .then(links => {
                const tbody = $('#social-links-table-body');
                tbody.empty();

                if (links.length === 0) {
                    tbody.append('<tr><td colspan="4" class="text-center text-muted">No social links added yet</td></tr>');
                    return;
                }

                links.forEach(link => {
                    tbody.append(`
                        <tr>
                            <td class="fw-bold">${link.platform_name}</td>
                            <td>
                                <i class="${link.icon_class} fa-lg text-primary me-2"></i>
                                <code>${link.icon_class}</code>
                            </td>
                            <td><a href="${link.url}" target="_blank" class="text-break">${link.url}</a></td>
                            <td>
                                <button class="btn-action btn-action-edit edit-social-btn" data-id="${link.id}" title="Edit Social Link">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-action btn-action-delete delete-social-btn" data-id="${link.id}" title="Delete Social Link">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `);
                });

                // Bind click events
                $('.edit-social-btn').off('click').click(function() {
                    openEditSocialModal($(this).data('id'));
                });
                $('.delete-social-btn').off('click').click(function() {
                    deleteSocialLink($(this).data('id'));
                });
            })
            .catch(err => console.error('Error loading social links:', err));
    }

    function openEditSocialModal(id) {
        fetch('/api/social-links')
            .then(res => res.json())
            .then(links => {
                const link = links.find(l => l.id === parseInt(id));
                if (!link) return;

                $('#socialId').val(link.id);
                $('#socialPlatform').val(link.platform_name);
                $('#socialIcon').val(link.icon_class);
                $('#socialUrl').val(link.url);

                $('#socialModalLabel').text('Edit Social Link');
                
                const myModal = new bootstrap.Modal(document.getElementById('socialModal'));
                myModal.show();
            })
            .catch(err => console.error('Error fetching social link details:', err));
    }

    function saveSocialLink() {
        const id = $('#socialId').val();
        const socialData = {
            platform_name: $('#socialPlatform').val(),
            icon_class: $('#socialIcon').val(),
            url: $('#socialUrl').val()
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/social-links/${id}` : '/api/social-links';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(socialData)
        })
        .then(res => {
            if (res.status === 200 || res.status === 201) {
                const modalEl = document.getElementById('socialModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                    $('#socialModal').modal('hide');
                }
                loadSocialLinks();
            } else {
                alert('Failed to save social link. Please check your data.');
            }
        })
        .catch(err => {
            console.error('Error saving social link:', err);
            alert('Server error saving social link.');
        });
    }

    function deleteSocialLink(id) {
        if (confirm('Are you sure you want to delete this social link?')) {
            fetch(`/api/social-links/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.status === 200) {
                        loadSocialLinks();
                    } else {
                        alert('Failed to delete social link.');
                    }
                });
        }
    }

    // ==========================================
    // 10. Map Locations Management
    // ==========================================
    function loadMapLocations() {
        fetch('/api/map-locations')
            .then(res => res.json())
            .then(locations => {
                const tbody = $('#map-locations-table-body');
                tbody.empty();

                if (locations.length === 0) {
                    tbody.append('<tr><td colspan="4" class="text-center text-muted">No map locations added yet</td></tr>');
                    return;
                }

                locations.forEach(loc => {
                    const statusBadge = loc.is_active === 1 
                        ? '<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Active</span>' 
                        : '<span class="badge bg-secondary">Inactive</span>';
                    
                    const activateBtn = loc.is_active !== 1
                        ? `<button class="btn btn-outline-success btn-xs py-1 px-2 activate-map-btn" data-id="${loc.id}" style="font-size: 0.75rem; margin-left: 8px;">
                               <i class="fas fa-check me-1"></i>Activate
                           </button>`
                        : '';

                    tbody.append(`
                        <tr>
                            <td class="fw-bold">${loc.title}</td>
                            <td>${loc.address}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    ${statusBadge}
                                    ${activateBtn}
                                </div>
                            </td>
                            <td>
                                <button class="btn-action btn-action-edit edit-map-btn" data-id="${loc.id}" title="Edit Location">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-action btn-action-delete delete-map-btn" data-id="${loc.id}" title="Delete Location">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `);
                });

                // Bind click events
                $('.edit-map-btn').off('click').click(function() {
                    openEditMapModal($(this).data('id'));
                });
                $('.delete-map-btn').off('click').click(function() {
                    deleteMapLocation($(this).data('id'));
                });
                $('.activate-map-btn').off('click').click(function() {
                    activateMapLocation($(this).data('id'));
                });
            })
            .catch(err => console.error('Error loading map locations:', err));
    }

    function openEditMapModal(id) {
        fetch('/api/map-locations')
            .then(res => res.json())
            .then(locations => {
                const loc = locations.find(l => l.id === parseInt(id));
                if (!loc) return;

                $('#mapId').val(loc.id);
                $('#mapTitle').val(loc.title);
                $('#mapAddress').val(loc.address);
                $('#mapUrl').val(loc.map_url);
                $('#mapIsActive').prop('checked', loc.is_active === 1);

                $('#mapModalLabel').text('Edit Map Location');
                
                const myModal = new bootstrap.Modal(document.getElementById('mapModal'));
                myModal.show();
            })
            .catch(err => console.error('Error fetching map location details:', err));
    }

    function saveMapLocation() {
        const id = $('#mapId').val();
        const mapData = {
            title: $('#mapTitle').val(),
            address: $('#mapAddress').val(),
            map_url: $('#mapUrl').val(),
            is_active: $('#mapIsActive').is(':checked')
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/map-locations/${id}` : '/api/map-locations';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mapData)
        })
        .then(res => {
            if (res.status === 200 || res.status === 201) {
                const modalEl = document.getElementById('mapModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                    $('#mapModal').modal('hide');
                }
                loadMapLocations();
            } else {
                alert('Failed to save map location. Please check your data.');
            }
        })
        .catch(err => {
            console.error('Error saving map location:', err);
            alert('Server error saving map location.');
        });
    }

    function activateMapLocation(id) {
        fetch(`/api/map-locations/${id}/activate`, {
            method: 'PUT'
        })
        .then(res => {
            if (res.status === 200) {
                loadMapLocations();
            } else {
                alert('Failed to activate map location.');
            }
        })
        .catch(err => {
            console.error('Error activating map location:', err);
            alert('Server error activating map location.');
        });
    }

    function deleteMapLocation(id) {
        if (confirm('Are you sure you want to delete this map location?')) {
            fetch(`/api/map-locations/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.status === 200) {
                        loadMapLocations();
                    } else {
                        alert('Failed to delete map location.');
                    }
                });
        }
    }
});

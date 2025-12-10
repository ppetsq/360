// Footer Component - Shared across all pages
document.addEventListener('DOMContentLoaded', function() {
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <div class="brand-icon amber-icon">IQ</div>
                        <span class="brand-text dark-version">SÄHKÖ</span>
                    </div>
                    <p class="footer-tagline">Älykotiasiantuntija vuodesta 2013</p>
                </div>

                <div class="footer-info-group">
                    <div class="footer-contact">
                        <h4 class="footer-title">Yhteystiedot</h4>
                        <p>Mika Lähteenmäki</p>
                        <p><a href="tel:+358406485860">040 6485860</a></p>
                        <p><a href="mailto:mika@iqsahko.fi">mika@iqsahko.fi</a></p>
                    </div>

                    <div class="footer-area">
                        <h4 class="footer-title">Osoite</h4>
                        <p>Muuttolinnunreitti 31</p>
                        <p>02660 Espoo</p>
                    </div>

                    <div class="footer-certs">
                        <h4 class="footer-title">Sertifikaatit</h4>
                        <p>TUKES S2</p>
                        <p>KNX Partner</p>
                        <p>Loxone Gold Partner</p>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2025 IQ Sähkö Oy | Y-tunnus: XXXXXXX-X</p>
            </div>
        </div>
    </footer>
    `;

    // Insert footer into the page
    document.body.insertAdjacentHTML('beforeend', footerHTML);
});

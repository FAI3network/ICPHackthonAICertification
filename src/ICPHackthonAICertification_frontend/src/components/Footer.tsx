import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <table>
        <tr>
          <th>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>viviana@siless.me</p>
            </div>
          </th>

          <th>
            <div className="footer-section">
              <h4>Social Media</h4>
              <div className="social-icons">
                <a href="#">
                  <i className="icon-twitter" />
                </a>
                <a href="#">
                  <i className="icon-facebook" />
                </a>
                <a href="#">
                  <i className="icon-linkedin" />
                </a>
                <a href="#">
                  <i className="icon-instagram" />
                </a>
              </div>
            </div>
          </th>
        </tr>

        <tr>
          <th colSpan={2}>
            <div className="footer-bottom">
              <p>© 2024 All Rights Reserved.</p>
              <p>Designed by FreeHTML5.co</p>
            </div>
          </th>
        </tr>

      </table>
    </footer>
  );
}
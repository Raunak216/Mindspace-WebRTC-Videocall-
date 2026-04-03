import React from "react";
import { Link } from "react-router-dom";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";

function LandingPage() {
  return (
    <div className="landingWrapper">
      <nav className="navbar">
        <h2 className="logo">
          Mind<span className="logoAccent">Space</span>.
        </h2>
        <Link to="/auth" className="navCta">
          Get Started
        </Link>
      </nav>

      <section className="heroSection">
        <div className="heroBadge">
          <span className="heroBadgeDot" />
          Study smarter, together
        </div>

        <h1 className="heroTitle">
          Group study,
          <br />
          <em className="heroTitleAccent">made simple.</em>
        </h1>

        <p className="heroSubtitle">
          Instant study rooms for focused group sessions. Clean video calls
          designed for learning - not distraction.
        </p>

        <div className="heroButtons">
          <Link to="/auth" className="ctaBtn">
            Start a Study Room
          </Link>
          <a href="#features" className="ctaBtnGhost">
            See how it works
          </a>
        </div>
      </section>

      <section className="featureSection" id="features">
        <div>
          <p className="featureLabel">Why MindSpace?</p>
          <h2 className="featureHeading">
            Built for students
            <br />
            who actually study.
          </h2>
          <p className="featureDesc">
            No ads, no noise, no distractions. Just a clean space to focus on
            what matters.
          </p>

          <ul className="featureList">
            <li>
              <div className="featureIcon">
                <StarBorderPurple500Icon />
              </div>
              <div>
                <strong className="featureItemTitle">Focus over noise</strong>
                <p>
                  Built for students who value deep work over social features.
                </p>
              </div>
            </li>
            <li>
              <div className="featureIcon">
                <LockOutlineIcon />
              </div>
              <div>
                <strong className="featureItemTitle">Private by design</strong>
                <p>
                  Join rooms with a single meeting code — no account required.
                </p>
              </div>
            </li>
            <li>
              <div className="featureIcon">
                <VideoCameraFrontIcon />
              </div>
              <div>
                <strong className="featureItemTitle">
                  Distraction-free video
                </strong>
                <p>Clean, minimal sessions designed to keep you in the zone.</p>
              </div>
            </li>
            <li>
              <div className="featureIcon">
                <AccessAlarmIcon />
              </div>
              <div>
                <strong className="featureItemTitle">
                  Accountability built in
                </strong>
                <p>
                  Consistent study sessions that build real habits over time.
                </p>
              </div>
            </li>
          </ul>
        </div>
        <div>
          <img
            className="landingImg"
            src="landingImg.png"
            alt="Landing_Image"
          />
        </div>
      </section>

      <footer className="footer">
        <p className="footerLogo">
          Mind<span className="logoAccent">Space</span>.
        </p>
        <p className="footerNote">© 2025 MindSpace. Made for students.</p>
      </footer>
    </div>
  );
}

export default LandingPage;

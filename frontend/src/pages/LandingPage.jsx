import React from "react";
import { Link } from "react-router-dom";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";

function LandingPage() {
  return (
    <div className="landingWrapper">
      <nav className="navbar">
        <h2 className="logo">MindSpace.</h2>
      </nav>

      <section className="heroSection">
        <h1 className="heroTitle">Group study,made simple</h1>
        <p className="heroSubtitle">
          Instant study rooms for focused group sessions. Simple video calls
          designed for learning.
        </p>

        <div className="heroButtons">
          <Link to="/auth" className="ctaBtn">
            Start a Study Room
          </Link>
        </div>
      </section>

      <section className="featureSection">
        <div className="featureLeft">
          <p className="featureHeading">Why MindSpace?</p>

          <ul className="featureList">
            <li>
              <StarBorderPurple500Icon />
              <p>
                Built for students who value <b>focus over noise</b>.
              </p>
            </li>

            <li>
              <LockOutlineIcon />
              <p>
                Simple and private study rooms - join with just one meeting
                code.
              </p>
            </li>

            <li>
              <VideoCameraFrontIcon />
              <p>
                Clean, distraction-free video sessions designed for learning.
              </p>
            </li>

            <li>
              <AccessAlarmIcon />
              <p>
                Designed for consistency, accountability, and real study habits.
              </p>
            </li>
          </ul>

          <p className="featureNote">
            More focus tools like notes, music, and timers are planned to be
            added in later version to truly improve focus.
          </p>
        </div>

        <div className="featureRight">
          <img src="/HomeImage1.png" alt="Hero image" />
        </div>
      </section>
    </div>
  );
}

export default LandingPage;

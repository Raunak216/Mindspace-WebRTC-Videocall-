import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../context/AuthContext";
import styles from "../styles/homeStyle.module.css";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import LockOutlineIcon from "@mui/icons-material/LockOutline";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);
  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <div className={styles.homeMainContainer}>
        <div className={styles.navbar}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "orange",
              marginLeft: "2rem",
              fontSize: "1.2rem",
            }}
          >
            <h2>MindSpace</h2>
          </div>

          <div className={styles.navLinks}>
            <IconButton
              onClick={() => {
                navigate("/history");
              }}
            >
              <p>History</p>
              <RestoreIcon />
            </IconButton>

            <Button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/auth");
              }}
            >
              <p style={{ color: "rgb(99, 2, 2)" }}>Logout</p>
            </Button>
          </div>
        </div>

        <div className={styles.meetContainer}>
          <div className={styles.leftPanel}>
            <h2>Welcome back to MindSpace</h2>
            <p>
              Every session brings you closer to your goals. Stay focused, study
              smart.
            </p>

            <div>
              <ul>
                <p>Here’s what you can do in your study room :</p>

                <li>
                  <VideoCameraFrontIcon />
                  <p>
                    Video Call Simplicity - Connect instantly with friends and
                    peers.
                  </p>
                </li>
                <li>
                  <LockOutlineIcon />
                  <p>Private Study Rooms - Join with just one Meeting ID.</p>
                </li>
                <li>
                  <StarBorderPurple500Icon />
                  <p>
                    Minimal, Distraction-Free UI - Focus only on what matters.
                  </p>
                </li>
                <li>
                  <MusicNoteIcon />
                  <p>
                    Study & Focus Music * : boost concentration and productivity
                  </p>
                </li>
                <li>
                  <AccessAlarmIcon />
                  <p>
                    Pomodoro Timer * - Stay productive with focused study
                    sprints.
                  </p>
                </li>
              </ul>
              <p style={{ fontSize: "1rem", fontWeight: "400" }}>
                * indicates upcoming features
              </p>
            </div>
          </div>
          <div className={styles.rightPanel}>
            <p>Enter a Meeting ID below to join your study room</p>

            <div className={styles.meetingtext}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                id="outlined-basic"
                label="Meeting Code"
                variant="outlined"
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
            </div>
            <p style={{ fontSize: "0.9rem", margin: "0.3rem" }}>
              Need a new room? Create one instantly.
            </p>
          </div>

          <div className="rightPanel">
            <img srcSet="/logo3.png" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);

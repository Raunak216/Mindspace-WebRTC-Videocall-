import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../context/AuthContext";
import styles from "../styles/homeStyle.module.css";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [focused, setFocused] = useState(false);

  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleJoinVideoCall();
  };

  return (
    <div className={styles.homeMainContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          Mind<span className={styles.logoAccent}>Space</span>.
        </div>

        <div className={styles.navLinks}>
          <button
            className={styles.historyBtn}
            onClick={() => navigate("/history")}
          >
            <RestoreIcon style={{ fontSize: "1rem" }} />
            History
          </button>

          <button
            className={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className={styles.meetContainer}>
        <div className={styles.badge}>Study session</div>

        <h1 className={styles.heading}>
          Ready to focus
          <br />
          today?
        </h1>

        <p className={styles.subText}>
          Every session brings you closer to your goals.
          <br />
          Stay consistent, study smart.
        </p>

        <div className={styles.inputRow}>
          <input
            className={`${styles.input} ${focused ? styles.inputFocused : ""}`}
            type="text"
            placeholder="Enter existing meeting ID "
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
          />
          <button className={styles.joinBtn} onClick={handleJoinVideoCall}>
            Join →
          </button>
        </div>

        <p className={styles.helperText}>Or create a new room instantly</p>
      </div>
    </div>
  );
}

export default withAuth(HomeComponent);

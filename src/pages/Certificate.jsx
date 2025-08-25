import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import API from "../services/api";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

// Certificate Card
const CertificateCard = React.forwardRef(({ student }, ref) => {
  // ✅ normalize data (captain vs member)
const data = student.recipientType === "captain"
  ? {
      name: student.captainId?.name,
      urn: student.captainId?.urn,
      branch: student.captainId?.branch,
      year: student.captainId?.year || "", // agar model me ho
    }
  : {
      name: student.memberInfo?.name,
      urn: student.memberInfo?.urn,
      branch: student.memberInfo?.branch,
      year: student.memberInfo?.year,
    };
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "1000px",
        height: "700px",
        backgroundImage: `url(${student.templateUrl || "/Certificates.png"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        margin: "0 auto",
      }}
    >
      {/* Name */}
      <div
        style={{
          position: "absolute",
          top: "340px",
          left: "0",
          width: "100%",
          textAlign: "center",
          fontSize: "32px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {data.name}
      </div>

      {/* URN */}
      <div
        style={{
          position: "absolute",
          top: "405px",
          left: "640px",
          fontSize: "24px",
          color: "#000",
        }}
      >
        {data.urn}
      </div>

      {/* Branch */}
      <div
        style={{
          position: "absolute",
          top: "405px",
          left: "185px",
          fontSize: "24px",
          color: "#000",
        }}
      >
       D{data.year} {data.branch}
      </div>

      {/* Position */}
      <div
        style={{
          position: "absolute",
          top: "465px",
          right: "750px",
          fontSize: "20px",
          color: "#000",
        }}
      >
        {student.position}
      </div>

      {/* Sport */}
      <div
        style={{
          position: "absolute",
          top: "465px",
          left: "435px",
          fontSize: "20px",
          color: "#000",
        }}
      >
        {student.sport}
      </div>

      {/* Session */}
      <div
        style={{
          position: "absolute",
          top: "465px",
          left: "710px",
          fontSize: "20px",
          color: "#000",
        }}
      >
        {student.session?.session || ""}
      </div>
    </div>
  );
});

const Certificate = () => {
  const [students, setStudents] = useState([]);
  const [selectedCaptain, setSelectedCaptain] = useState(null);
  const certRefs = useRef([]);
  const { captainId } = useParams();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await API.get(`/admin/certificates/${captainId}`);
        console.log("Certificates API Response:", res.data);

        if (res.data && res.data.length > 0) {
          setStudents(res.data);
          certRefs.current = res.data.map(() => React.createRef());
          setSelectedCaptain({ captainId });
        }
      } catch (err) {
        console.error("Error fetching certificates", err);
      }
    };
    fetchCertificates();
  }, [captainId]);

  const generateAllPDFs = async () => {
    if (students.length === 0) return;
    const pdf = new jsPDF("landscape", "px", "a4");

    for (let i = 0; i < students.length; i++) {
      const input = certRefs.current[i].current;
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();

      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
    }

    pdf.save("Certificates.pdf");
  };

const sendToCaptain = async (captainId) => {
  try {
    await API.post(`/admin/certificates/send/${captainId}`);
    alert("Certificates sent!");
  } catch (err) {
    console.error(err);
    alert("Error sending certificates");
  }
};


  const btnStyle = {
    marginTop: "10px",
    padding: "8px 16px",
    fontSize: "16px",
    cursor: "pointer",
    color: "white",
    borderRadius: "6px",
    border: "none",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="text-xl font-bold mb-4">Certificate Management</h2>

      {selectedCaptain && students.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Certificate Preview</h3>
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            navigation={true}
            modules={[Navigation]}
            style={{ width: "1050px", margin: "auto" }}
          >
            {students.map((stu, index) => (
              <SwiperSlide key={index}>
                <CertificateCard ref={certRefs.current[index]} student={stu} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={generateAllPDFs}
              style={{ ...btnStyle, backgroundColor: "#2563eb" }}
            >
              Download All
            </button>
            <button
              onClick={() => sendToCaptain(captainId)}
              style={{
                ...btnStyle,
                backgroundColor: "#16a34a",
                marginLeft: "10px",
              }}
            >
              Send to Captain
            </button>
            <button
              onClick={() => {
                setSelectedCaptain(null);
                setStudents([]);
              }}
              style={{
                ...btnStyle,
                backgroundColor: "#6b7280",
                marginLeft: "10px",
              }}
            >
              Back to List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;

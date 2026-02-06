import { Video } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { QRCodeSVG } from "qrcode.react";
import React from 'react';

export const MyComposition: React.FC = () => {
    const { width, height } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            <Video
                src={staticFile("input_video.mp4")}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                }}
            />

            {/* Container for CTA and QR */}
            <div style={{
                position: "absolute",
                bottom: 150,
                right: 300,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 20
            }}>
                {/* CTA Text */}
                <div style={{
                    color: "white",
                    fontSize: 50,
                    fontWeight: "bold",
                    fontFamily: "sans-serif",
                    textShadow: "0 4px 8px rgba(0,0,0,0.8)",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: "10px 20px",
                    borderRadius: 10,
                }}>
                    こちらをタップ👉
                </div>

                {/* QR Code Box */}
                <div style={{
                    padding: 20,
                    backgroundColor: "white",
                    borderRadius: 15,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                }}>
                    <QRCodeSVG value="https://movie-qr-read.vercel.app" size={200} />
                    <p style={{ margin: "10px 0 0", fontSize: 24, fontWeight: "bold", fontFamily: "sans-serif", color: "black" }}>Scan Me</p>
                </div>
            </div>
        </AbsoluteFill>
    );
};

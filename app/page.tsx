"use client";

import { useState, FormEvent } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleContinue = (e: FormEvent) => {
    e.preventDefault();
    console.log("Sign up with:", { email, password });
  };

  const handleGoogleSignUp = () => {
    console.log("Sign up with Google");
  };

  return (
    <div className="flex w-screen h-screen bg-white items-center justify-center overflow-hidden">
      <div className="flex w-full max-w-[1440px] h-full max-h-[900px] relative">
        {/* Background Image - Full Design */}
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/1dc35600c66828abf3a0b630139326b4948b7a68?width=2880"
          alt="Meraki Sign Up Design"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Interactive Form Overlay */}
        <div className="relative z-10 flex w-full h-full">
          {/* Left side - Logo (no interaction needed, covered by background) */}
          <div className="w-[624px] h-full" />

          {/* Right side - Form */}
          <div className="w-[624px] h-full flex items-center justify-center">
            <div className="w-[406px] relative" style={{ top: "170px" }}>
              <form onSubmit={handleContinue}>
                {/* Sign up title - positioned to match background */}
                <div className="absolute left-[31px] top-0 opacity-0">
                  <h1 className="text-[20px]" style={{ fontFamily: "PP Neue Montreal", fontWeight: 375, color: "#5A5253" }}>
                    Sign up
                  </h1>
                </div>

                {/* Email Input */}
                <div className="absolute left-[31px] top-[112px] w-[344px]">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="w-full bg-transparent border-none outline-none text-[16px] pb-1"
                    style={{ 
                      fontFamily: "Arial",
                      color: "#5A5253",
                      caretColor: "#5A5253"
                    }}
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="absolute left-[31px] top-[181px] w-[344px]">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className="w-full bg-transparent border-none outline-none text-[16px] pb-1"
                    style={{ 
                      fontFamily: "Arial",
                      color: "#5A5253",
                      caretColor: "#5A5253"
                    }}
                    required
                  />
                </div>

                {/* Continue Button - Invisible overlay over background button */}
                <button
                  type="submit"
                  className="absolute left-[95px] top-[266px] w-[216px] h-[64px] bg-transparent border-none cursor-pointer opacity-0 hover:opacity-10 transition-opacity"
                  aria-label="Continue"
                />

                {/* Google Button - Invisible overlay */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="absolute left-[103px] top-[435px] w-[216px] h-[64px] bg-transparent border-none cursor-pointer opacity-0 hover:opacity-10 transition-opacity"
                  aria-label="Sign up with Google"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

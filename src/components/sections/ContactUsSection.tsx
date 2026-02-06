'use client';

import React, { useState } from "react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import MainButton from "../common/MainButton";

function ContactUsSection() { 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    type: 'say_hi',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          type: formData.type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit form');
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        message: '',
        type: 'say_hi',
      });

      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      console.error('Contact form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col md:flex-row gap-8 md:gap-[40px] items-center ">
        <div className="px-2 bg-primary inline-block font-medium text-h2 rounded-md">
          Contact Us
        </div>
        <p className="text-p">
          Connect with Us: Let's Discuss Your Digital Marketing Needs
        </p>
      </div>
      <div className="flex relative justify-start items-center px-16 py-12 bg-[#F3F3F3] rounded-[45px] overflow-hidden mt-[80px]">
        <form onSubmit={handleSubmit} className="bg-gray sm:p-6 h-full w-full xl:max-w-lg">
          <div className="flex flex-col sm:flex-row gap-[35px] sm:items-center mb-10">
                <RadioGroup value={formData.type} onValueChange={handleTypeChange} defaultValue="comfortable" className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="say_hi" id="r1" />
                    <Label htmlFor="r1" className="text-pMobile md:text-p font-normal">Say Hi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="get_a_quote" id="r2" />
                    <Label htmlFor="r2" className="text-pMobile md:text-p font-normal">Get a Qoute</Label>
                  </div>
                </RadioGroup>
          </div>

              <div className="mb-4">
                <p className="mb-2 block text-black text-pMobile md:text-p">Name</p>
                <Input type="text" placeholder="Name" className="w-full px-[30px] py-[25px] border border-black rounded-[14px] text-black outline-none text-pMobile"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <p className="mb-2 block text-black text-pMobile md:text-p">Email*</p>
                <Input type="email" placeholder="Email" className="w-full px-[30px] py-[25px] border border-black rounded-[14px] text-black outline-none text-pMobile"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <p className="mb-2 block text-black text-pMobile md:text-p">Message*</p>
                <Textarea placeholder="Message" className="w-full px-[30px] py-[18px] border border-black rounded-[14px] text-black outline-none text-pMobile"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>

            {status === 'success' && (
              <div className="mt-[20px] p-3 bg-green-100 text-green-800 rounded">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {status === 'error' && (
              <div className="mt-[20px] p-3 bg-red-100 text-red-800 rounded">
                {errorMessage}
              </div>
            )}

            <div className="mt-[30px]">
              <MainButton
                text="Send Message"
                isSubmitable
                classes="bg-secondary text-white text-[18px] w-full md:w-full hover:text-black"
              />
            </div>
        </form>

        <div className="absolute right-[-35%] 2xl:right-[-25%] top-[2%] bottom-[2%] hidden xl:block">
          <img
            src="/images/contact_illustration.png"
            alt="illustration"
          />
        </div>
      </div>
    </section>
  );
}

export default ContactUsSection;

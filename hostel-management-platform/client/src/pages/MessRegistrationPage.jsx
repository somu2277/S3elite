import React, { useState } from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  Building,
  Briefcase,
  Home,
  CheckCircle2,
  AlertCircle,
  Utensils,
  ArrowRight,
  ArrowLeft,
  QrCode,
  UploadCloud
} from 'lucide-react';

const MessRegistrationPage = ({ onCancel }) => {
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    address: '',
    collegeCompany: '',
    occupation: 'Student',
    mealPreference: 'Veg',
    startDate: new Date().toISOString().split('T')[0],
    plan: 'Standard Monthly (₹3500)',
    notes: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploadError('');
    setIsUploading(true);
    
    const uploadData = new FormData();
    uploadData.append('paymentScreenshot', file);

    try {
      const res = await fetch('/api/public/upload-payment', {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPaymentScreenshotUrl(data.url);
      } else {
        setUploadError(data.message || 'Failed to upload screenshot');
      }
    } catch (err) {
      setUploadError('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/mess-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          utrNumber,
          paymentScreenshot: paymentScreenshotUrl
        })
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccess(true);
      } else {
        setError(json.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-bgLight relative overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-lg glass-card p-10 text-center space-y-6 border border-amber-500/40 z-10 shadow-2xl">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-textDark">Registration Successful!</h2>
          <p className="text-textMuted text-sm leading-relaxed">
            Your Monthly Mess application has been submitted.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-borderLight text-left space-y-2">
            <p className="text-xs text-textMuted font-bold uppercase tracking-wider">Next Steps</p>
            <p className="text-xs text-textMuted">1. Admin will review your subscription request.</p>
            <p className="text-xs text-textMuted">2. Our team will contact you for plan activation & payment.</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-textDark font-bold text-xs transition-all shadow-lg mt-4"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-bgLight relative overflow-hidden py-10">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl flex flex-col items-center justify-center z-10 space-y-6">
        
        <div className="w-full text-center space-y-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
            <Utensils className="w-7 h-7 text-textDark" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-textDark leading-tight">
            Monthly Mess Registration
          </h1>

          {onCancel && (
            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-1.5 text-xs text-textMuted hover:text-textDark transition-colors mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          )}
        </div>

        <div className="glass-card w-full p-8 border border-borderLight bg-cardBg/90 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-textMuted" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-textMuted" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-textMuted" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Primary Mobile Number"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-textMuted" />
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="WhatsApp Number"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-textMuted mb-1">Current Address</label>
              <div className="relative">
                <Home className="absolute left-3 top-3 w-4 h-4 text-textMuted" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full Residential Address"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Occupation & College/Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-textMuted" />
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Student">Student</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">College / Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-textMuted" />
                  <input
                    type="text"
                    name="collegeCompany"
                    value={formData.collegeCompany}
                    onChange={handleChange}
                    placeholder="e.g. IIT Hyderabad or Infosys"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Meal Preference & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Meal Preference</label>
                <div className="relative">
                  <Utensils className="absolute left-3 top-3 w-4 h-4 text-textMuted" />
                  <select
                    name="mealPreference"
                    value={formData.mealPreference}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Expected Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-medium text-textMuted mb-1">Additional Notes (Optional)</label>
              <div className="relative">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any specific dietary requirements or queries..."
                  rows="3"
                  className="w-full px-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Section */}
            <div className="mt-8 border-t border-borderLight/80 pt-6">
              <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Payment Details
              </h3>
              <p className="text-xs text-textMuted mb-4 leading-relaxed">
                To confirm your booking request, please complete the payment using the UPI details below. After payment, enter your 12-digit UTR number and upload the payment screenshot.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-borderLight mb-4 flex flex-col md:flex-row gap-6 items-center md:items-start justify-center">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
                  <img src="/payment_qr.png" alt="PhonePe QR Code" className="w-32 h-32 object-contain" />
                </div>
                <div className="text-center md:text-left space-y-2 w-full max-w-xs">
                  <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Payment Method</p>
                  <p className="text-sm font-bold text-textDark">PhonePe / UPI</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider">UPI ID</p>
                      <p className="text-xs font-mono font-bold text-textDark mt-0.5">7569712731@ybl</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider">PhonePe No.</p>
                      <p className="text-xs font-mono font-bold text-textDark mt-0.5">7569712731</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 inline-block bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg w-full">
                    <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Monthly Mess Fee</p>
                    <p className="text-lg font-black text-emerald-600">₹3500</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">12-Digit UTR Number</label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Enter 12-digit UTR Number"
                    className="w-full px-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textDark focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Payment Screenshot</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="mess-payment-screenshot"
                    />
                    <label
                      htmlFor="mess-payment-screenshot"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-borderLight rounded-xl text-xs text-textMuted cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <UploadCloud className="w-4 h-4" />
                      {isUploading ? 'Uploading...' : paymentScreenshotUrl ? 'Screenshot Uploaded' : 'Upload Screenshot (Max 5MB)'}
                    </label>
                  </div>
                  {uploadError && <p className="text-[10px] text-rose-400 mt-1">{uploadError}</p>}
                  {paymentScreenshotUrl && <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Successfully attached</p>}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isUploading || utrNumber.length !== 12 || !paymentScreenshotUrl}
              className={`w-full py-3.5 rounded-xl text-textDark font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-4 
                ${isSubmitting || isUploading || utrNumber.length !== 12 || !paymentScreenshotUrl ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'}`}
            >
              {isSubmitting ? 'Submitting Application...' : 'Apply for Monthly Mess'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessRegistrationPage;

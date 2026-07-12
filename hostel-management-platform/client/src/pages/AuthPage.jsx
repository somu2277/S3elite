import React, { useState } from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  Building,
  Briefcase,
  Home,
  FileText,
  ArrowRight,
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  QrCode,
  UploadCloud
} from 'lucide-react';

const AuthPage = ({ selectedRoomCot = null, onCancel }) => {
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    fatherName: '',
    emergencyContact: '',
    currentAddress: '',
    collegeCompany: '',
    occupation: 'Student',
    gender: 'Male',
    expectedJoiningDate: '',
    aadhaar: '',
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
    
    if (!selectedRoomCot) {
      setError('Please select a room and cot first from the homepage.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/booking-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preferredRoom: selectedRoomCot.room,
          preferredBed: selectedRoomCot.cot,
          roomRent: selectedRoomCot.rent || 6000,
          utrNumber,
          paymentScreenshot: paymentScreenshotUrl
        })
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        setBookingSuccess(true);
      } else {
        setError(json.message || 'Booking failed. Bed might no longer be available.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-darkBg relative overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-lg glass-card p-10 text-center space-y-6 border border-emerald-500/40 z-10 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">Booking Request Submitted!</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your reservation request for <strong>Room {selectedRoomCot.room} (Cot #{selectedRoomCot.cot})</strong> has been successfully placed. The bed is now <strong className="text-amber-400">Reserved</strong> pending admin approval.
          </p>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-left space-y-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Next Steps</p>
            <p className="text-xs text-slate-300">1. The Hostel Admin will review your application.</p>
            <p className="text-xs text-slate-300">2. You will receive a WhatsApp message and Email confirmation.</p>
            <p className="text-xs text-slate-300">3. A team member will contact you at <strong>{formData.phone}</strong> for payment and admission details.</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all shadow-lg mt-4"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-darkBg relative overflow-hidden py-10">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl flex flex-col items-center justify-center z-10 space-y-6">
        
        <div className="w-full text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">S3 Elite</span> PG
          </h1>

          {onCancel && (
            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bed Availability
            </button>
          )}

          {selectedRoomCot ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 space-y-2 shadow-lg max-w-sm mx-auto text-left">
              <div className="flex items-center gap-2 font-bold text-sm border-b border-emerald-500/20 pb-2">
                <BedDouble className="w-5 h-5 text-emerald-400" />
                Selected Cot for Reservation
              </div>
              <p className="text-xs text-slate-200 pt-1">
                Room <strong className="text-white">{selectedRoomCot.room}</strong> • Cot <strong className="text-white">#{selectedRoomCot.cot}</strong> ({selectedRoomCot.floor})
              </p>
              <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20 space-y-1.5 mt-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Room Rent:</span>
                  <span className="font-semibold text-white">₹{selectedRoomCot.rent || 6000}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-sm shadow-lg max-w-sm mx-auto">
              Please return to the homepage and select a bed to book.
            </div>
          )}
        </div>

        {selectedRoomCot && (
          <div className="glass-card w-full p-8 border border-slate-800 bg-darkCard/90 shadow-2xl">
            <div className="mb-6 border-b border-slate-800/80 pb-4">
              <h2 className="text-xl font-bold text-white">Hostel Booking Application</h2>
              <p className="text-xs text-slate-400 mt-0.5">Submit your details to request a booking. Admin will review and approve.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Father / Guardian Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      placeholder="Enter father's name"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Primary Mobile Number"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      placeholder="WhatsApp Number"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Emergency Contact</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="Emergency Contact Number"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Address</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleChange}
                    placeholder="Full Residential Address"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Occupation & College/Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Occupation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <select
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="Student">Student</option>
                      <option value="Working Professional">Working Professional</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">College / Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="collegeCompany"
                      value={formData.collegeCompany}
                      onChange={handleChange}
                      placeholder="e.g. IIT Hyderabad or Infosys"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Aadhaar Number (Optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="aadhaar"
                      value={formData.aadhaar}
                      onChange={handleChange}
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected Joining Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="expectedJoiningDate"
                      value={formData.expectedJoiningDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Additional Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special requests or notes for the admin..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none h-20 resize-none"
                />
              </div>

              {/* Payment Section */}
              <div className="mt-8 border-t border-slate-800/80 pt-6">
                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <QrCode className="w-4 h-4" /> Payment Details
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  To confirm your booking request, please complete the payment using the UPI details below. After payment, enter your 12-digit UTR number and upload the payment screenshot.
                </p>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-4 flex flex-col md:flex-row gap-6 items-center md:items-start justify-center">
                  <div className="bg-white p-2 rounded-xl">
                    <QrCode className="w-32 h-32 text-slate-900" />
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <p className="text-xs text-slate-400">Official UPI ID</p>
                    <p className="text-sm font-bold text-white">s3elitepg@sbi</p>
                    <p className="text-xs text-slate-400 mt-2">Account Holder</p>
                    <p className="text-sm font-bold text-white">S3 Elite PG</p>
                    <div className="mt-3 inline-block bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <p className="text-xs text-slate-400">Amount Payable</p>
                      <p className="text-lg font-black text-emerald-400">₹{selectedRoomCot.rent || 6000}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">12-Digit UTR Number</label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="Enter 12-digit UTR Number"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Payment Screenshot</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="payment-screenshot"
                      />
                      <label
                        htmlFor="payment-screenshot"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 cursor-pointer hover:bg-slate-800 transition-colors"
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
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-4 
                  ${isSubmitting || isUploading || utrNumber.length !== 12 || !paymentScreenshotUrl ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'}`}
              >
                {isSubmitting ? 'Submitting Request...' : 'Request Booking'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;

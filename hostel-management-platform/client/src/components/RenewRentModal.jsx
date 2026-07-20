import React, { useState, useEffect } from 'react';
import { X, Phone, Key, Calendar, CreditCard, Upload, CheckCircle2, AlertCircle, ChevronRight, MapPin, User, Home, BedDouble } from 'lucide-react';

const RenewRentModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1 State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  
  const [roomsData, setRoomsData] = useState([]);

  useEffect(() => {
    fetch('/api/public/rooms')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRoomsData(data.data || []);
        }
      })
      .catch(console.error);
  }, []);
  
  // Step 2 State
  const [residentData, setResidentData] = useState(null);
  const [renewalDuration, setRenewalDuration] = useState(1);
  
  // Step 3 State
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');

  // Handle Verify Resident
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/rent-renewal/verify-resident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, roomNumber, bedNumber })
      });
      const data = await res.json();
      
      if (data.success) {
        setResidentData(data.data);
        setStep(2);
      } else {
        setError(data.message || 'Invalid details. Please check and try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('paymentScreenshot', file);

    try {
      const res = await fetch('/api/public/upload-payment', {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPaymentScreenshot(data.url); // Use the backend URL
      } else {
        setError(data.message || 'Failed to upload screenshot');
      }
    } catch (err) {
      setError('Network error during upload');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRenewal = async () => {
    if (!utrNumber || !paymentScreenshot) {
      setError('Please provide both UTR number and payment screenshot.');
      return;
    }

    setLoading(true);
    setError('');
    
    // Calculate new paid until date for display/storage
    const currentPaidUntil = new Date(residentData.paidUntil);
    const newPaidUntil = new Date(currentPaidUntil);
    newPaidUntil.setMonth(newPaidUntil.getMonth() + renewalDuration);

    try {
      const res = await fetch('/api/rent-renewal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentBed: residentData.residentBed,
          studentName: residentData.studentName,
          bookingId: residentData.bookingId,
          phone: residentData.phone,
          roomNumber: residentData.roomNumber,
          bedNumber: residentData.bedNumber,
          monthlyRent: residentData.monthlyRent,
          renewalDuration,
          amount: residentData.monthlyRent * renewalDuration,
          previousPaidUntil: currentPaidUntil.toISOString(),
          proposedNewPaidUntil: newPaidUntil.toISOString(),
          utrNumber,
          paymentScreenshot // Real uploaded backend URL
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setStep(4); // Success step
      } else {
        setError(data.message || 'Failed to submit renewal. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = () => {
    if (!residentData) return 0;
    return residentData.monthlyRent * renewalDuration;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-borderLight flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-textDark">Renew / Pay Rent</h2>
            <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mt-0.5">Existing Resident Portal</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-textMuted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          {step < 4 && (
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center w-full max-w-sm">
                <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-slate-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-slate-300'}`}>1</div>
                  <span className="text-[10px] font-bold uppercase">Verify</span>
                </div>
                <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-slate-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-slate-300'}`}>2</div>
                  <span className="text-[10px] font-bold uppercase">Review</span>
                </div>
                <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-slate-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-slate-300'}`}>3</div>
                  <span className="text-[10px] font-bold uppercase">Payment</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* STEP 1: Verify Resident */}
          {step === 1 && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Resident Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-borderLight focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Registered Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-borderLight focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Room Number</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                    <select
                      required
                      value={roomNumber}
                      onChange={(e) => { setRoomNumber(e.target.value); setBedNumber(''); }}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-borderLight focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none appearance-none cursor-pointer text-slate-800"
                    >
                      <option value="">Select Room</option>
                      {roomsData.map(room => (
                        <option key={room.roomNumber} value={room.roomNumber}>{room.roomNumber}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Cot Number</label>
                  <div className="relative">
                    <BedDouble className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                    <select
                      required
                      value={bedNumber}
                      onChange={(e) => setBedNumber(e.target.value)}
                      disabled={!roomNumber}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-borderLight focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none appearance-none cursor-pointer disabled:opacity-50 text-slate-800"
                    >
                      <option value="">Select Cot</option>
                      {roomNumber && roomsData.find(r => r.roomNumber === roomNumber)?.beds.map(bed => (
                        <option key={bed.bedNumber} value={bed.bedNumber}>Cot {bed.bedNumber}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-primary hover:bg-orange-600 text-white font-black text-sm transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/30 mt-4 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? 'Verifying...' : 'Find My Stay Details'}
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          {/* STEP 2: Review & Duration */}
          {step === 2 && residentData && (
            <div className="space-y-6">
              {/* Current Stay Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-borderLight">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-textDark text-lg">{residentData.studentName}</h3>
                    <p className="text-xs font-bold text-textMuted uppercase">{residentData.bookingId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Room / Cot</p>
                    <p className="font-black text-textDark">{residentData.roomNumber} - Cot {residentData.bedNumber}</p>
                    <p className="text-[10px] font-bold text-primary mt-1">{residentData.sharing}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Monthly Rent</p>
                    <p className="font-black text-textDark">₹{residentData.monthlyRent?.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Paid Until / Next Due</p>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-400 line-through text-sm">
                          {new Date(residentData.paidUntil).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <ChevronRight className="w-4 h-4 text-primary" />
                        <p className="font-black text-primary text-sm">
                          {(() => {
                            const d = new Date(residentData.paidUntil);
                            d.setMonth(d.getMonth() + renewalDuration);
                            return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Status</p>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                        residentData.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        residentData.paymentStatus === 'Overdue' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {residentData.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Renewal Duration Selection */}
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-3">Select Renewal Duration</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 3, 6, 12].map(months => (
                    <button
                      key={months}
                      onClick={() => setRenewalDuration(months)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        renewalDuration === months 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-borderLight hover:border-slate-300 text-textMuted'
                      }`}
                    >
                      <p className="font-black text-lg leading-none mb-1">{months}</p>
                      <p className="text-[10px] font-bold uppercase">{months === 1 ? 'Month' : 'Months'}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold opacity-90 uppercase tracking-wider mb-1">Total Payable Amount</p>
                  <p className="text-2xl font-black">₹{calculateAmount().toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-lg bg-white text-primary font-black text-sm transition-transform hover:scale-105"
                >
                  Proceed
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && residentData && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs font-bold text-textMuted uppercase mb-1">Amount to Pay</p>
                <p className="text-3xl font-black text-primary">₹{calculateAmount().toLocaleString()}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-200 text-left">
                  <p className="text-[10px] font-bold text-textMuted uppercase mb-2">New Paid Until Date (After Verification)</p>
                  <p className="font-semibold text-textDark flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    {(() => {
                      const d = new Date(residentData.paidUntil);
                      d.setMonth(d.getMonth() + renewalDuration);
                      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                    })()}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-white border border-slate-200 rounded-xl">
                  <img src="/payment_qr.png" alt="Payment QR" className="max-w-[200px]" onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200?text=Scan+QR';
                  }} />
                </div>
                <div className="bg-slate-100 p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-textMuted font-bold">Payment Method</p>
                    <p className="font-bold text-textDark text-sm">PhonePe / UPI</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-textMuted font-bold">UPI ID</p>
                    <p className="font-mono font-bold text-textDark text-sm">7569712731@ybl</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-textMuted font-bold">PhonePe Number</p>
                    <p className="font-mono font-bold text-textDark text-sm">7569712731</p>
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">12-Digit UTR Number</label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="Enter UTR from payment app"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-borderLight focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Payment Screenshot</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-borderLight rounded-xl hover:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden group">
                    {paymentScreenshot ? (
                       <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                         {/* Show local fallback if it's not a full URL or if we want to construct full url */}
                         <img src={paymentScreenshot.startsWith('http') ? paymentScreenshot : `/api/${paymentScreenshot}`} alt="Uploaded" className="max-h-full opacity-80" />
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <p className="text-white font-bold text-xs">Change Screenshot</p>
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-textMuted">
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-xs font-semibold">Click to upload screenshot</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleScreenshotUpload} />
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-textDark font-bold text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitRenewal}
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl bg-primary hover:bg-orange-600 text-white font-black text-sm transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? 'Submitting...' : 'Submit Rent Renewal'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-textDark mb-3">Renewal Submitted!</h2>
              <p className="text-sm text-textMuted font-medium max-w-sm mx-auto mb-8 leading-relaxed">
                Your rent renewal payment of <strong className="text-textDark font-bold">₹{calculateAmount().toLocaleString()}</strong> has been submitted. It is currently pending admin verification. Your new paid-until date will be updated shortly!
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-textDark font-bold text-sm transition-colors"
              >
                Close & Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenewRentModal;

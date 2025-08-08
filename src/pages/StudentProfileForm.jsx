import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const StudentProfileForm = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    dob: '',
    gender: '',
    contact: '',
    address: '',
    sessionYear: '',
    sessionTerm: '',
    semester: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/student/profile', { withCredentials: true });
        const data = res.data;
        setProfile(data);

        if (data.personalDetails) {
          const [sessionYear, sessionTermRaw] = (data.session || '').split(' ');
          const sessionTerm = sessionTermRaw?.includes('Jan') ? 'Jan–June' : 'July–Dec';

          setFormData({
            dob: data.personalDetails.dob?.slice(0, 10) || '',
            gender: data.personalDetails.gender || '',
            contact: data.personalDetails.contact || '',
            address: data.personalDetails.address || '',
            sessionYear: sessionYear || '',
            sessionTerm: sessionTerm || '',
            semester: data.semester || ''
          });
        }

        if (data.isRegistered) {
          navigate('/student/dashboard');
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const session = `${formData.sessionYear} ${formData.sessionTerm}`;
      const payload = {
        personalDetails: {
          dob: formData.dob,
          gender: formData.gender,
          contact: formData.contact,
          address: formData.address
        },
        session,
        semester: formData.semester
      };

      await API.put('/student/profile', payload, { withCredentials: true });
      alert('✅ Profile saved successfully.');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to save profile. Check session formatting or server logs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async () => {
    setApprovalSubmitting(true);
    try {
      await API.post('/student/submit-profile', {}, { withCredentials: true });
      alert('✅ Submitted for approval.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('❌ Submission failed. Please ensure your profile is saved correctly.');
    } finally {
      setApprovalSubmitting(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  const isSubmitted = profile?.lockedForUpdate || profile?.pendingUpdateRequest;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Student Profile</h2>

      {isSubmitted && (
        <p className="text-yellow-600 font-semibold mb-2">
          🚧 Your profile has been submitted and is pending approval.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
          disabled={isSubmitted}
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
          disabled={isSubmitted}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          name="contact"
          placeholder="Contact"
          value={formData.contact}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
          disabled={isSubmitted}
        />

        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
          disabled={isSubmitted}
        />

        {/* Session Year */}
        <input
          name="sessionYear"
          placeholder="Session Year (e.g. 2025)"
          value={formData.sessionYear}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
          disabled={isSubmitted}
        />

        {/* Session Term */}
        <select
          name="sessionTerm"
          value={formData.sessionTerm}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
          disabled={isSubmitted}
        >
          <option value="">Select Session Term</option>
          <option value="Jan–June">Jan–June</option>
          <option value="July–Dec">July–Dec</option>
        </select>

        {/* Semester */}
        <select
          name="semester"
          value={formData.semester}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
          disabled={isSubmitted}
        >
          <option value="">Select Semester</option>
          <option value="Sem 1">Sem 1</option>
          <option value="Sem 2">Sem 2</option>
          <option value="Sem 3">Sem 3</option>
          <option value="Sem 4">Sem 4</option>
          <option value="Sem 5">Sem 5</option>
          <option value="Sem 6">Sem 6</option>
        </select>

        {!isSubmitted && (
          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              onClick={handleSubmitForApproval}
              disabled={approvalSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              {approvalSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default StudentProfileForm;

// pages/CreateCaptain.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../components/ui/modal';
import { 
  Crown, 
  Plus, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import CaptainsAndTeams from './CaptainsAndTeams';

export default function CreateCaptain() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Selected captain for viewing/editing
const [selectedCaptain, setSelectedCaptain] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [editForm, setEditForm] = useState({});

// Function to start editing captain
const startEditing = (captain) => {
  setIsEditing(true);
  setEditForm({
    name: captain.name || '',
    branch: captain.branch || '',
    year: captain.year || '',
    urn: captain.urn || '',
    sport: captain.sport || '',
    email: captain.email || '',
    phone: captain.phone || '',
    teamMemberCount: captain.teamMemberCount || '',
  });
  setSelectedCaptain(captain);
};



  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    urn: '',
    year: '',
    sport: '',
    teamMemberCount: '',
    sessionId: '',
    role: 'captain'
  });

  const [sessions, setSessions] = useState([]);
  const [captains, setCaptains] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterURN, setFilterURN] = useState('');
  const [filterSport, setFilterSport] = useState('');

  useEffect(() => {
    // simulate loading
    setTimeout(() => setLoading(false), 600);

    API.get('/session/active')
      .then(res => {
        if (res.data?._id) {
          setSessions([res.data]);
          setForm(f => ({ ...f, sessionId: res.data._id }));
        }
      })
      .catch(() => setMessage('⚠ No active session found.'));
    
    // fetch existing captains for display
    API.get('/admin/captains')
      .then(res => setCaptains(res.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await API.post('/admin/create-user', form);
      setMessage(res.data.message);
      setTimeout(() => {
        setShowModal(false);
        setSubmitLoading(false);
        setMessage('');
        // optionally refresh captain list
        API.get('/admin/users?role=captain')
          .then(res => setCaptains(res.data || []))
          .catch(() => {});
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating captain');
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/admin')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Captain Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage team captains</p>
          </div>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Captain
        </Button>
      </motion.div>

      {/* Create Captain Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Create New Captain
          </ModalTitle>
        </ModalHeader>
        <ModalContent>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
                message.includes('success') || message.includes('created')
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {message.includes('success') || message.includes('created') ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  name="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Branch</label>
                <Input
                  name="branch"
                  placeholder="Enter branch"
                  value={form.branch}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">URN</label>
                <Input
                  name="urn"
                  placeholder="Enter URN"
                  value={form.urn}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Year</label>
                <Input
                  name="year"
                  type="number"
                  placeholder="Enter year"
                  value={form.year}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sport</label>
                <Input
                  name="sport"
                  placeholder="Enter sport"
                  value={form.sport}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Team Member Count</label>
                <Input
                  name="teamMemberCount"
                  type="number"
                  placeholder="Enter team size"
                  value={form.teamMemberCount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Session</label>
                <Select
                  value={form.sessionId}
                  onChange={(e) => setForm({ ...form, sessionId: e.target.value })}
                  required
                >
                  <option value="">Select Session</option>
                  {sessions.map(session => (
                    <option key={session._id} value={session._id}>
                      {session.session}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </form>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitLoading}
            className="flex items-center gap-2"
          >
            {submitLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Captain
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Captain Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Captain Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-foreground">Filter by Name</label>
                <Input value={filterName} onChange={(e)=>setFilterName(e.target.value)} placeholder="e.g. John" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Filter by URN</label>
                <Input value={filterURN} onChange={(e)=>setFilterURN(e.target.value)} placeholder="URN" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Filter by Sport</label>
                <Input value={filterSport} onChange={(e)=>setFilterSport(e.target.value)} placeholder="e.g. Football" />
              </div>
            </div>
            <CaptainsAndTeams 
              nameFilter={filterName}
              urnFilter={filterURN}
              sportFilter={filterSport}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

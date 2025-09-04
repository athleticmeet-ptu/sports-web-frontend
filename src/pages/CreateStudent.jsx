// pages/CreateStudent.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '../components/ui/modal';
import { 
  UserPlus, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import AllStudents from './AllStudents';

export default function Students() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    course: '',
    year: '',
    sessionId: '',
    sports: [],
    role: 'student',
  });

  const [students, setStudents] = useState([]); // future API
  const [sessions, setSessions] = useState([]);
  // Stats: participated and 1st/2nd/3rd counts
  const [stats, setStats] = useState({ participated: 0, first: 0, second: 0, third: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // Custom dropdown states
  const [courseOpen, setCourseOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);

  const courses = ['B.Tech CSE', 'B.Tech IT', 'MBA'];
  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
    API.get('/session/active')
      .then(res => {
        if (res.data?._id) {
          setSessions([res.data]);
          setForm(f => ({ ...f, sessionId: res.data._id }));
        }
      })
      .catch(() => setMessage('⚠ No active session found.'));

    // Load stats
    const loadStats = async () => {
      try {
        setStatsError('');
        setStatsLoading(true);
        const res = await API.get('/admin/students');
        const students = res.data || [];
        let participated = 0, first = 0, second = 0, third = 0;
        students.forEach(st => {
          (st.positions || []).forEach(pos => {
            const p = (pos?.position || '').toLowerCase();
            if (p.includes('particip')) participated += 1;
            else if (p.includes('1')) first += 1;
            else if (p.includes('2')) second += 1;
            else if (p.includes('3')) third += 1;
          });
        });
        setStats({ participated, first, second, third });
      } catch (e) {
        setStatsError('Failed to load stats');
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rollNumber' && !/^\d*$/.test(value)) return;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await API.post('/admin/create-user', form);
      setMessage(res.data.message);
      setTimeout(() => {
        setShowModal(false);
        setSubmitLoading(false);
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating student');
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

          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage student accounts</p>
          </div>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Create Student
        </Button>
      </motion.div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setMessage('');
        }}
        className="max-w-2xl"
      >
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Create New Student
          </ModalTitle>
        </ModalHeader>

        <ModalContent>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
                message.includes('Error') || message.includes('⚠') 
                  ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              }`}
            >
              {message.includes('Error') || message.includes('⚠') ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="text-sm font-medium text-foreground">Email Address</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">URN (Roll Number)</label>
                <Input
                  name="rollNumber"
                  placeholder="Enter URN"
                  value={form.rollNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Course</label>
                <Select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Year</label>
                <Select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  required
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
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
                    <option key={session._id} value={session._id}>{session.session}</option>
                  ))}
                </Select>
              </div>
            </div>
          </form>
        </ModalContent>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowModal(false);
              setMessage('');
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitLoading}
            onClick={handleSubmit}
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
                Create Student
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Student Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Student Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AllStudents />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import {
  Building2, Users, GraduationCap, BookOpen, Layers, DoorClosed, TestTube,
  Search, Plus, Edit2, Trash2, X
} from 'lucide-react';

export const MasterData = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Auxiliary data for dropdown selects
  const [departmentsList, setDepartmentsList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const tabs = [
    { id: 'departments', label: 'Departments', singular: 'Department', icon: Building2, endpoint: '/master/departments' },
    { id: 'faculty', label: 'Faculty', singular: 'Faculty', icon: Users, endpoint: '/master/faculty' },
    { id: 'students', label: 'Students', singular: 'Student', icon: GraduationCap, endpoint: '/master/students' },
    { id: 'subjects', label: 'Subjects', singular: 'Subject', icon: BookOpen, endpoint: '/master/subjects' },
    { id: 'sections', label: 'Sections', singular: 'Section', icon: Layers, endpoint: '/master/sections' },
    { id: 'classrooms', label: 'Classrooms', singular: 'Classroom', icon: DoorClosed, endpoint: '/master/classrooms' },
    { id: 'labs', label: 'Laboratories', singular: 'Laboratory', icon: TestTube, endpoint: '/master/labs' },
  ];

  const currentTabObj = tabs.find((t) => t.id === activeTab);

  const loadAuxiliaryData = async () => {
    try {
      const [deptRes, secRes] = await Promise.all([
        fetchAPI('/master/departments'),
        fetchAPI('/master/sections'),
      ]);
      if (deptRes.success) setDepartmentsList(deptRes.data);
      if (secRes.success) setSectionsList(secRes.data);
    } catch (err) {
      console.error('Failed to load auxiliary lists:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI(`${currentTabObj.endpoint}?search=${encodeURIComponent(search)}`);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('Failed to load master data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuxiliaryData();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, search]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      department: departmentsList[0]?._id || '',
      section: sectionsList[0]?._id || '',
      semester: 5,
      credits: 3,
      weeklyPeriods: 3,
      maxWeeklyWorkload: 18,
      capacity: 60,
      studentCount: 50,
      requiresLab: false,
      batch: '2023-2027',
      designation: 'Assistant Professor',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      name: item.name || item.user?.name || '',
      email: item.email || item.user?.email || '',
      department: item.department?._id || item.department || departmentsList[0]?._id || '',
      section: item.section?._id || item.section || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await fetchAPI(`${currentTabObj.endpoint}/${editingItem._id}`, {
          method: 'PUT',
          body: formData,
        });
        if (res.success) {
          alert(`${currentTabObj.singular} updated successfully!`);
          setShowModal(false);
          loadData();
        }
      } else {
        const res = await fetchAPI(currentTabObj.endpoint, {
          method: 'POST',
          body: formData,
        });
        if (res.success) {
          alert(`${currentTabObj.singular} created successfully!`);
          setShowModal(false);
          loadData();
        }
      }
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete '${title}'?`)) return;
    try {
      const res = await fetchAPI(`${currentTabObj.endpoint}/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        alert('Record deleted successfully.');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Academic Master Data Store</h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">Full CRUD operations for departments, staff, students, subjects, sections, classrooms, and labs.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Add New {currentTabObj.singular}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                setSearch('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
                active
                  ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/20'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${currentTabObj.label.toLowerCase()}...`}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Data Table with Full CRUD Controls */}
      <div className="saas-card p-6">
        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-xs">Loading records...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-xs">No {currentTabObj.label.toLowerCase()} found. Click "Add New" above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold bg-[#F8FAFC]">
                  {activeTab === 'departments' && (
                    <>
                      <th className="py-3 px-3.5 rounded-l-xl">Code</th>
                      <th className="py-3 px-3.5">Department Name</th>
                      <th className="py-3 px-3.5">Building</th>
                      <th className="py-3 px-3.5">Email</th>
                      <th className="py-3 px-3.5 rounded-r-xl text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'faculty' && (
                    <>
                      <th className="py-3 px-3.5 rounded-l-xl">Emp ID</th>
                      <th className="py-3 px-3.5">Name</th>
                      <th className="py-3 px-3.5">Email</th>
                      <th className="py-3 px-3.5">Department</th>
                      <th className="py-3 px-3.5">Designation</th>
                      <th className="py-3 px-3.5">Max Workload</th>
                      <th className="py-3 px-3.5 rounded-r-xl text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'students' && (
                    <>
                      <th className="py-3 px-3.5 rounded-l-xl">Roll Number</th>
                      <th className="py-3 px-3.5">Name</th>
                      <th className="py-3 px-3.5">Email</th>
                      <th className="py-3 px-3.5">Department</th>
                      <th className="py-3 px-3.5">Section</th>
                      <th className="py-3 px-3.5">Semester</th>
                      <th className="py-3 px-3.5 rounded-r-xl text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'subjects' && (
                    <>
                      <th className="py-3 px-3.5 rounded-l-xl">Code</th>
                      <th className="py-3 px-3.5">Subject Name</th>
                      <th className="py-3 px-3.5">Department</th>
                      <th className="py-3 px-3.5">Credits</th>
                      <th className="py-3 px-3.5">Weekly Periods</th>
                      <th className="py-3 px-3.5">Lab Required</th>
                      <th className="py-3 px-3.5 rounded-r-xl text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'sections' && (
                    <>
                      <th className="py-3 px-3.5 rounded-l-xl">Section Name</th>
                      <th className="py-3 px-3.5">Department</th>
                      <th className="py-3 px-3.5">Semester</th>
                      <th className="py-3 px-3.5">Student Count</th>
                      <th className="py-3 px-3.5 rounded-r-xl text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'classrooms' && (
                    <>
                      <th className="py-3 px-3.5 rounded-l-xl">Room Number</th>
                      <th className="py-3 px-3.5">Building</th>
                      <th className="py-3 px-3.5">Capacity</th>
                      <th className="py-3 px-3.5">Facilities</th>
                      <th className="py-3 px-3.5 rounded-r-xl text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'labs' && (
                    <>
                      <th className="py-3 px-3.5 rounded-l-xl">Lab Name</th>
                      <th className="py-3 px-3.5">Room Number</th>
                      <th className="py-3 px-3.5">Department</th>
                      <th className="py-3 px-3.5">Capacity</th>
                      <th className="py-3 px-3.5 rounded-r-xl text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                {data.map((item) => (
                  <tr key={item._id} className="hover:bg-[#F8FAFC] transition">
                    {activeTab === 'departments' && (
                      <>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#4F46E5]">{item.code}</td>
                        <td className="py-3 px-3.5 font-bold text-[#0F172A]">{item.name}</td>
                        <td className="py-3 px-3.5 text-[#64748B]">{item.building}</td>
                        <td className="py-3 px-3.5 text-[#64748B] font-mono">{item.contactEmail || 'N/A'}</td>
                      </>
                    )}
                    {activeTab === 'faculty' && (
                      <>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#4F46E5]">{item.employeeId}</td>
                        <td className="py-3 px-3.5 font-bold text-[#0F172A]">{item.user?.name}</td>
                        <td className="py-3 px-3.5 text-[#64748B] font-mono">{item.user?.email}</td>
                        <td className="py-3 px-3.5 font-semibold">{item.department?.code}</td>
                        <td className="py-3 px-3.5 text-[#64748B]">{item.designation}</td>
                        <td className="py-3 px-3.5 font-bold text-[#0F172A]">{item.maxWeeklyWorkload} hrs</td>
                      </>
                    )}
                    {activeTab === 'students' && (
                      <>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#4F46E5]">{item.rollNumber}</td>
                        <td className="py-3 px-3.5 font-bold text-[#0F172A]">{item.user?.name}</td>
                        <td className="py-3 px-3.5 text-[#64748B] font-mono">{item.user?.email}</td>
                        <td className="py-3 px-3.5 font-semibold">{item.department?.code}</td>
                        <td className="py-3 px-3.5 text-[#64748B] font-medium">{item.section?.name || 'Unassigned'}</td>
                        <td className="py-3 px-3.5 font-bold">Sem {item.semester}</td>
                      </>
                    )}
                    {activeTab === 'subjects' && (
                      <>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#4F46E5]">{item.code}</td>
                        <td className="py-3 px-3.5 font-bold text-[#0F172A]">{item.name}</td>
                        <td className="py-3 px-3.5 font-semibold">{item.department?.code}</td>
                        <td className="py-3 px-3.5 font-bold text-[#0F172A]">{item.credits}</td>
                        <td className="py-3 px-3.5">{item.weeklyPeriods} periods</td>
                        <td className="py-3 px-3.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${item.requiresLab ? 'bg-purple-50 text-[#7C3AED] border-purple-200' : 'bg-slate-100 text-[#64748B] border-[#E2E8F0]'}`}>
                            {item.requiresLab ? 'YES' : 'NO'}
                          </span>
                        </td>
                      </>
                    )}
                    {activeTab === 'sections' && (
                      <>
                        <td className="py-3 px-3.5 font-bold text-[#0F172A]">{item.name}</td>
                        <td className="py-3 px-3.5 font-semibold">{item.department?.code}</td>
                        <td className="py-3 px-3.5 font-bold">Sem {item.semester}</td>
                        <td className="py-3 px-3.5 font-bold text-[#10B981]">{item.studentCount} Students</td>
                      </>
                    )}
                    {activeTab === 'classrooms' && (
                      <>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#4F46E5]">{item.roomNumber}</td>
                        <td className="py-3 px-3.5 text-[#0F172A] font-medium">{item.building}</td>
                        <td className="py-3 px-3.5 font-bold text-[#10B981]">{item.capacity} Seats</td>
                        <td className="py-3 px-3.5 text-[#64748B]">{item.facilities?.join(', ')}</td>
                      </>
                    )}
                    {activeTab === 'labs' && (
                      <>
                        <td className="py-3 px-3.5 font-bold text-[#0F172A]">{item.name}</td>
                        <td className="py-3 px-3.5 font-mono text-[#7C3AED] font-bold">{item.roomNumber}</td>
                        <td className="py-3 px-3.5 font-semibold">{item.department?.code}</td>
                        <td className="py-3 px-3.5 font-bold text-[#10B981]">{item.capacity} Workstations</td>
                      </>
                    )}

                    {/* Universal Action Buttons */}
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#4F46E5] hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name || item.user?.name || item.code || item.roomNumber || item.rollNumber || item.employeeId)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F43F5E] hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Add & Edit Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">
                {editingItem ? `Edit ${currentTabObj.singular}` : `Add New ${currentTabObj.singular}`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#64748B] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* DEPARTMENTS FORM */}
              {activeTab === 'departments' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CSE"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Department Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Science & Engineering"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Building</label>
                    <input
                      type="text"
                      placeholder="e.g. Tech Block A"
                      value={formData.building || ''}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Contact Email</label>
                    <input
                      type="email"
                      placeholder="cse@university.edu"
                      value={formData.contactEmail || ''}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                    />
                  </div>
                </>
              )}

              {/* FACULTY FORM */}
              {activeTab === 'faculty' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ravi Kumar"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="ravi@university.edu"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Employee ID</label>
                      <input
                        type="text"
                        required
                        placeholder="FAC001"
                        value={formData.employeeId || ''}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Department</label>
                      <select
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      >
                        {departmentsList.map((d) => (
                          <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Designation</label>
                      <select
                        value={formData.designation || 'Assistant Professor'}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      >
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Max Workload (hrs/wk)</label>
                      <input
                        type="number"
                        value={formData.maxWeeklyWorkload || 18}
                        onChange={(e) => setFormData({ ...formData, maxWeeklyWorkload: Number(e.target.value) })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STUDENTS FORM */}
              {activeTab === 'students' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Student Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Student 1"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="student1@university.edu"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Roll Number</label>
                      <input
                        type="text"
                        required
                        placeholder="23CSE001"
                        value={formData.rollNumber || ''}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Department</label>
                      <select
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      >
                        {departmentsList.map((d) => (
                          <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Section</label>
                      <select
                        value={formData.section || ''}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      >
                        <option value="">-- Select Section --</option>
                        {sectionsList.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Semester</label>
                      <input
                        type="number"
                        value={formData.semester || 5}
                        onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SUBJECTS FORM */}
              {activeTab === 'subjects' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Subject Code</label>
                      <input
                        type="text"
                        required
                        placeholder="CS501"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Department</label>
                      <select
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      >
                        {departmentsList.map((d) => (
                          <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Subject Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Database Management Systems"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Credits</label>
                      <input
                        type="number"
                        value={formData.credits || 3}
                        onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Weekly Periods</label>
                      <input
                        type="number"
                        value={formData.weeklyPeriods || 3}
                        onChange={(e) => setFormData({ ...formData, weeklyPeriods: Number(e.target.value) })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Semester</label>
                      <input
                        type="number"
                        value={formData.semester || 5}
                        onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="requiresLab"
                      checked={formData.requiresLab || false}
                      onChange={(e) => setFormData({ ...formData, requiresLab: e.target.checked })}
                      className="rounded border-[#E2E8F0] text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                    <label htmlFor="requiresLab" className="text-xs font-bold text-[#0F172A]">
                      Requires Dedicated Laboratory Room
                    </label>
                  </div>
                </>
              )}

              {/* SECTIONS FORM */}
              {activeTab === 'sections' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Section Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CSE-A"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Department</label>
                      <select
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      >
                        {departmentsList.map((d) => (
                          <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Semester</label>
                      <input
                        type="number"
                        value={formData.semester || 5}
                        onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Student Count</label>
                      <input
                        type="number"
                        value={formData.studentCount || 55}
                        onChange={(e) => setFormData({ ...formData, studentCount: Number(e.target.value) })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* CLASSROOMS FORM */}
              {activeTab === 'classrooms' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Room Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ROOM-301"
                      value={formData.roomNumber || ''}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Building</label>
                      <input
                        type="text"
                        placeholder="Tech Block A"
                        value={formData.building || ''}
                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Seating Capacity</label>
                      <input
                        type="number"
                        required
                        value={formData.capacity || 60}
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* LABORATORIES FORM */}
              {activeTab === 'labs' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Laboratory Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Advanced Computing & Data Science Lab"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Room Number</label>
                      <input
                        type="text"
                        required
                        placeholder="LAB-CSE-01"
                        value={formData.roomNumber || ''}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Department</label>
                      <select
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      >
                        {departmentsList.map((d) => (
                          <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">Workstations</label>
                      <input
                        type="number"
                        value={formData.capacity || 35}
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-xs font-semibold hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-indigo-500/20"
                >
                  {editingItem ? 'Update Record' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

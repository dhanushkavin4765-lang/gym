import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Search, Eye, Filter, User, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import GymLoader from '../components/GymLoader';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [plans, setPlans] = useState([]);

  // Fetch all members or search members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      let res;
      if (searchQuery.trim().length > 0) {
        res = await API.get(`/members/search?q=${searchQuery}`);
      } else {
        // Fetch all with filters
        let endpoint = '/members';
        if (statusFilter) {
          endpoint += `?status=${statusFilter}`;
        }
        res = await API.get(endpoint);
      }
      setMembers(res.data);
    } catch (error) {
      console.error('Error fetching members list:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch plans to display names
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await API.get('/plans');
        setPlans(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [searchQuery, statusFilter]);

  // Calculations for remaining days in client UI
  const getRemainingDays = (expiryDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(expiryDate);
    exp.setHours(0,0,0,0);
    
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 0 ? 0 : diffDays;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h1 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 600 }}>MEMBER DIRECTORY</h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>View complete database of enrolled athletes, filter status, and access invoices.</p>
      </div>

      {/* Filter and Search Bar Pane */}
      <div className="glass-panel" style={{
        padding: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '13px', color: 'var(--text-gray)' }} />
          <input
            type="text"
            placeholder="Search by Name, ID, mobile, PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input"
            style={{ paddingLeft: '48px' }}
          />
        </div>

        {/* Filter Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)' }}>
            <Filter size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>STATUS:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setSearchQuery(''); // Clear search when filtering status
              setStatusFilter(e.target.value);
            }}
            className="premium-input"
            style={{ width: '160px', padding: '10px' }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

      </div>

      {/* Directory Content */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <GymLoader text="LOADING MEMBER ROSTER..." color="var(--gold-primary)" />
          </div>
        ) : members.length === 0 ? (
          <div style={{ padding: '40px', textAlignment: 'center', color: 'var(--text-gray)', textAlign: 'center' }}>
            No members found matching the active criteria.
          </div>
        ) : (
          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Member ID</th>
                  <th>PIN</th>
                  <th>Mobile</th>
                  <th>Plan Subscribed</th>
                  <th>Remaining Days</th>
                  <th>Pending Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const remDays = getRemainingDays(member.expiryDate);
                  
                  return (
                    <motion.tr
                      key={member._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Avatar & Name */}
                      <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={member.photo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=100'}
                          alt={member.fullName}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid var(--border-glass)'
                          }}
                        />
                        <span style={{ fontWeight: 500 }}>{member.fullName}</span>
                      </td>

                      <td style={{ fontFamily: 'Space Grotesk', fontSize: '0.85rem' }}>{member.memberId}</td>
                      
                      <td style={{ fontFamily: 'Space Grotesk', color: '#10b981', fontWeight: 600 }}>{member.pin}</td>

                      <td>{member.mobile}</td>

                      <td>{member.plan?.name || 'Custom Plan'}</td>

                      <td style={{ fontWeight: 500 }}>
                        {remDays === 0 ? (
                          <span style={{ color: 'var(--status-expired)' }}>0 Days</span>
                        ) : remDays <= 7 ? (
                          <span style={{ color: 'var(--status-warning)' }}>{remDays} Days</span>
                        ) : (
                          <span>{remDays} Days</span>
                        )}
                      </td>

                      <td style={{ fontFamily: 'Space Grotesk', color: member.feesPending > 0 ? 'var(--status-warning)' : 'var(--text-white)' }}>
                        ${member.feesPending}
                      </td>

                      <td>
                        <span className={`badge ${
                          member.status === 'Active'
                            ? 'badge-active'
                            : member.status === 'Expired'
                            ? 'badge-expired'
                            : 'badge-warning'
                        }`}>
                          {member.status}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/members/${member._id}`}
                          className="outline-btn"
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            gap: '4px'
                          }}
                        >
                          <Eye size={14} />
                          Details
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default Members;

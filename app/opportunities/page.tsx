"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';

/*
 * Opportunities List Page
 *
 * This page allows an authenticated user to search for live
 * opportunities using the backend API and save interesting
 * opportunities to their Supabase database.  It uses Supabase
 * client-side authentication to protect access and associate
 * saved records with the current user.  If no session exists the
 * user is redirected to the login page.
 */

// Define a minimal shape for an opportunity as returned from the
// backend API.  Properties may be optional depending on the API
// response.  This interface can be extended as the API evolves.
interface Opportunity {
  notice_id?: string;
  solicitation_number?: string;
  id?: string;
  title: string;
  agency_name?: string;
  type?: string;
  naics_code?: string;
  psc_code?: string;
  posted_date?: string;
  response_deadline?: string;
  link_url?: string;
}

export default function Opportunities() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // On mount, verify that a user session exists.  If not, redirect
    // to the login page.  Otherwise store the user ID for later
    // inserts into the opportunities table.
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
    };
    fetchUser();
  }, [router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('keywords', searchTerm);
      params.set('limit', '50');
      const data = await apiFetch<{ opportunities?: Opportunity[]; opportunitiesData?: Opportunity[] }>(
        `/api/opportunities/search?${params.toString()}`
      );
      const opportunities = data.opportunities || data.opportunitiesData || [];
      setResults(opportunities);
      if (opportunities.length === 0) {
        setMessage('No opportunities found for your search.');
      }
    } catch (err: any) {
      setMessage(err.message || 'An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (opp: Opportunity) => {
    if (!userId) {
      router.push('/login');
      return;
    }
    setMessage('');
    try {
      const supabase = createClient();
      // Insert a simplified record into the opportunities table.  You
      // can adjust the columns to match your table schema.  Unknown
      // fields are omitted.  The user_id links this record to the
      // authenticated user.
      const insertData = {
        user_id: userId,
        notice_id: opp.notice_id || opp.id || opp.solicitation_number,
        title: opp.title,
        agency_name: opp.agency_name,
        naics_code: opp.naics_code,
        psc_code: opp.psc_code,
        posted_date: opp.posted_date,
        response_deadline: opp.response_deadline,
        link_url: opp.link_url,
      };
      const { error } = await supabase.from('opportunities').insert([insertData]);
      if (error) {
        setMessage(`Error saving opportunity: ${error.message}`);
      } else {
        setMessage('Opportunity saved successfully!');
      }
    } catch (err: any) {
      setMessage('An error occurred while saving. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Search Opportunities</h1>
          <p className="text-gray-600 mt-1">
            Enter keywords to search federal contract opportunities and save the ones that match your business.
          </p>
        </div>
        <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by keywords, agency, NAICS code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {message && (
          <div className="mb-4 text-sm text-gray-700">
            {message}
          </div>
        )}
        <div className="space-y-4">
          {results.map((opp, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-500 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{opp.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {opp.agency_name && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Agency:</span> {opp.agency_name}
                  </span>
                )}
                {opp.naics_code && (
                  <span>
                    <span className="font-medium">NAICS:</span> {opp.naics_code}
                  </span>
                )}
                {opp.psc_code && (
                  <span>
                    <span className="font-medium">PSC:</span> {opp.psc_code}
                  </span>
                )}
                {opp.posted_date && (
                  <span>
                    <span className="font-medium">Posted:</span> {new Date(opp.posted_date).toLocaleDateString()}
                  </span>
                )}
                {opp.response_deadline && (
                  <span>
                    <span className="font-medium">Deadline:</span> {new Date(opp.response_deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSave(opp)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Opportunity
                </button>
                {opp.link_url && (
                  <a
                    href={opp.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Details
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

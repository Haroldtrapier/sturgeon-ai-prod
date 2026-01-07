import { useState } from 'react';
import {
  Paper, Typography, TextField, Button, Box, Chip, Card, CardContent, Grid,
  CircularProgress, Alert, Stepper, Step, StepLabel, List, ListItem,
  ListItemText, Divider,
} from '@mui/material';
import {
  Search as SearchIcon, CheckCircle as CheckIcon, AutoAwesome as AIIcon,
} from '@mui/icons-material';

class APIClient {
  constructor() {
    this.baseURL = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
      : 'http://localhost:8000';
  }

  async searchOpportunities(keywords) {
    const response = await fetch(`${this.baseURL}/api/v1/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords, page: 1, page_size: 50 }),
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }

  async matchOpportunities(opportunityIds, naicsCodes, certifications) {
    const response = await fetch(`${this.baseURL}/api/v1/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opportunity_ids: opportunityIds,
        naics_codes: naicsCodes.split(',').map(c => c.trim()),
        certifications: certifications.split(',').map(c => c.trim()),
      }),
    });
    if (!response.ok) throw new Error('Matching failed');
    return response.json();
  }
}

export default function MatchPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [naics, setNaics] = useState('');
  const [certs, setCerts] = useState('');
  const [matches, setMatches] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const apiClient = new APIClient();
  const steps = ['Search Opportunities', 'Select Opportunities', 'Enter Your Profile', 'View AI Matches'];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError('');
    try {
      const keywords = query.split(',').map(k => k.trim()).filter(Boolean);
      const response = await apiClient.searchOpportunities(keywords);
      setSearchResults(response.items || []);
      setActiveStep(1);
    } catch (error) {
      setSearchError(error.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleProceedToProfile = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one opportunity');
      return;
    }
    setActiveStep(2);
  };

  const handleRunMatch = async () => {
    if (!naics.trim() || !certs.trim()) {
      alert('Please fill in all profile fields');
      return;
    }
    setIsMatching(true);
    setMatchError('');
    try {
      const response = await apiClient.matchOpportunities(selectedIds, naics, certs);
      const enrichedMatches = response.matches.map(match => {
        const opp = searchResults.find(o => o.id === match.opportunity_id);
        return { ...match, opportunity: opp };
      });
      enrichedMatches.sort((a, b) => b.match_score - a.match_score);
      setMatches(enrichedMatches);
      setActiveStep(3);
    } catch (error) {
      setMatchError(error.message || 'Matching failed');
    } finally {
      setIsMatching(false);
    }
  };

  const handleReset = () => {
    setQuery(''); setSearchResults([]); setSelectedIds([]);
    setNaics(''); setCerts(''); setMatches(null); setActiveStep(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color="primary" />ContractMatch AI
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Find and match government contract opportunities with AI-powered insights
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
      </Paper>

      {activeStep === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Step 1: Search for Opportunities</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter keywords (comma-separated) to search for relevant contract opportunities
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField fullWidth label="Search Keywords" placeholder="e.g., cloud, security, infrastructure"
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()} disabled={isSearching} />
            <Button variant="contained" onClick={handleSearch} disabled={isSearching || !query.trim()}
              startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />} sx={{ minWidth: 120 }}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </Box>
          {searchError && <Alert severity="error" sx={{ mt: 2 }}>{searchError}</Alert>}
        </Paper>
      )}

      {activeStep === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Step 2: Select Opportunities ({selectedIds.length} selected)
          </Typography>
          {searchResults.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>No opportunities found. Try different keywords.</Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {searchResults.map(opp => (
                <Grid item xs={12} key={opp.id}>
                  <Card sx={{ border: selectedIds.includes(opp.id) ? 2 : 1,
                    borderColor: selectedIds.includes(opp.id) ? 'primary.main' : 'divider',
                    cursor: 'pointer', '&:hover': { bgColor: 'action.hover' }}}
                    onClick={() => toggleSelection(opp.id)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                        {selectedIds.includes(opp.id) && <CheckIcon color="primary" />}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{opp.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {opp.description}
                          </Typography>
                          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {opp.value && <Chip label={`$${opp.value.toLocaleString()}`} size="small" color="success" />}
                            {opp.deadline && <Chip label={`Deadline: ${opp.deadline}`} size="small" variant="outlined" />}
                            {opp.tags?.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button onClick={() => setActiveStep(0)}>Back</Button>
            <Button variant="contained" onClick={handleProceedToProfile} disabled={selectedIds.length === 0}>
              Continue to Profile
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Step 3: Provide Your Company Profile</Typography>
          <Box sx={{ mt: 3 }}>
            <TextField fullWidth label="NAICS Codes" placeholder="e.g., 541511, 541512, 541519"
              value={naics} onChange={e => setNaics(e.target.value)}
              helperText="Enter your relevant NAICS codes (comma-separated)" sx={{ mb: 3 }} />
            <TextField fullWidth label="Certifications" placeholder="e.g., 8(a), HUBZone, WOSB, SDVOSB"
              value={certs} onChange={e => setCerts(e.target.value)}
              helperText="Enter your business certifications (comma-separated)" multiline rows={3} />
          </Box>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button onClick={() => setActiveStep(1)}>Back</Button>
            <Button variant="contained" onClick={handleRunMatch}
              disabled={isMatching || !naics.trim() || !certs.trim()}
              startIcon={isMatching ? <CircularProgress size={20} /> : <AIIcon />}>
              {isMatching ? 'Analyzing...' : 'Run AI Match'}
            </Button>
          </Box>
          {matchError && <Alert severity="error" sx={{ mt: 2 }}>{matchError}</Alert>}
        </Paper>
      )}

      {activeStep === 3 && matches && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Step 4: AI Match Results</Typography>
          <List sx={{ mt: 2 }}>
            {matches.map((match, index) => (
              <Box key={match.opportunity_id}>
                <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch',
                  bgColor: index === 0 ? 'success.50' : 'background.paper',
                  borderRadius: 1, mb: 2, border: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                    <Typography variant="h6">{match.opportunity?.title || 'Unknown'}</Typography>
                    <Chip label={`${match.match_score.toFixed(0)}% Match`}
                      color={match.match_score >= 80 ? 'success' : match.match_score >= 60 ? 'warning' : 'default'}
                      sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {match.opportunity?.description}
                  </Typography>
                  <Typography variant="subtitle2" color="primary" gutterBottom>Match Reasons:</Typography>
                  <List dense>
                    {match.reasons.map((reason, i) => (
                      <ListItem key={i} sx={{ py: 0.5 }}>
                        <CheckIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                        <ListItemText primary={reason} />
                      </ListItem>
                    ))}
                  </List>
                  {match.opportunity?.value && (
                    <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
                      Estimated Value: ${match.opportunity.value.toLocaleString()}
                    </Typography>
                  )}
                </ListItem>
                {index < matches.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={handleReset}>Start New Search</Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

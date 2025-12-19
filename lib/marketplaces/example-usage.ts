/**
 * Example usage of the searchSam function
 * This file demonstrates how to use the SAM.gov integration
 */

import { searchSam, type Opportunity } from './index';

/**
 * Example 1: Basic search for IT opportunities
 */
export async function searchITOpportunities() {
  const opportunities = await searchSam({
    query: 'information technology'
  });
  
  console.log(`Found ${opportunities.length} IT opportunities`);
  return opportunities;
}

/**
 * Example 2: Search with NAICS code filter
 * NAICS 541511 = Custom Computer Programming Services
 */
export async function searchSoftwareDevelopment() {
  const opportunities = await searchSam({
    query: 'software development',
    naics: '541511'
  });
  
  console.log(`Found ${opportunities.length} software development opportunities`);
  return opportunities;
}

/**
 * Example 3: Process opportunities data
 */
export async function processOpportunities(query: string) {
  const opportunities = await searchSam({ query });
  
  // Extract useful information
  const summary = opportunities.map((opp: Opportunity) => ({
    id: opp.noticeId,
    title: opp.title,
    agency: opp.fullParentPathName,
    posted: opp.postedDate,
    deadline: opp.responseDeadLine,
    naics: opp.naicsCode,
    link: opp.uiLink
  }));
  
  return summary;
}

/**
 * Example 4: Filter opportunities by deadline
 */
export async function getUpcomingDeadlines(query: string, daysAhead: number = 30) {
  const opportunities = await searchSam({ query });
  
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + daysAhead);
  
  return opportunities.filter((opp: Opportunity) => {
    if (!opp.responseDeadLine) return false;
    const deadline = new Date(opp.responseDeadLine);
    return deadline >= now && deadline <= futureDate;
  });
}

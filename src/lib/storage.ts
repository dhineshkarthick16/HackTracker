import { Competition, DashboardStats, Round, RoundInput } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

const LOCAL_STORAGE_KEY_PREFIX = 'hacktrack_data_';

// Helper to get local data partition for a user
function getLocalCompetitions(userId: string): Competition[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}competitions_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local competitions', err);
    return [];
  }
}

function saveLocalCompetitions(userId: string, competitions: Competition[]): void {
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_KEY_PREFIX}competitions_${userId}`,
      JSON.stringify(competitions)
    );
  } catch (err) {
    console.error('Error saving local competitions', err);
  }
}

export const DataService = {
  // Check if live Supabase is active
  isLiveSupabase(): boolean {
    return isSupabaseConfigured() && supabase !== null;
  },

  // Fetch all competitions for a specific user
  async getCompetitions(userId: string): Promise<Competition[]> {
    if (!userId) return [];

    if (this.isLiveSupabase() && supabase) {
      const { data: compData, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (compError) {
        console.error('Supabase getCompetitions error:', compError);
        throw new Error(compError.message);
      }

      if (!compData || compData.length === 0) return [];

      const compIds = compData.map((c) => c.id);
      const { data: roundsData, error: roundsError } = await supabase
        .from('rounds')
        .select('*')
        .in('competition_id', compIds)
        .order('round_order', { ascending: true });

      if (roundsError) {
        console.error('Supabase rounds error:', roundsError);
      }

      const roundsByCompId: Record<string, Round[]> = {};
      (roundsData || []).forEach((r: Round) => {
        if (!roundsByCompId[r.competition_id]) {
          roundsByCompId[r.competition_id] = [];
        }
        roundsByCompId[r.competition_id].push(r);
      });

      return compData.map((c) => ({
        ...c,
        rounds: roundsByCompId[c.id] || [],
      }));
    }

    // Local Storage fallback mode with strict user isolation
    const local = getLocalCompetitions(userId);
    // Sort latest created first by default
    return local.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // Get a single competition by ID (verifying user ownership)
  async getCompetitionById(userId: string, id: string): Promise<Competition | null> {
    if (!userId || !id) return null;

    if (this.isLiveSupabase() && supabase) {
      const { data: comp, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (compError || !comp) return null;

      const { data: rounds } = await supabase
        .from('rounds')
        .select('*')
        .eq('competition_id', id)
        .order('round_order', { ascending: true });

      return {
        ...comp,
        rounds: rounds || [],
      };
    }

    // Local Storage mode
    const list = getLocalCompetitions(userId);
    const found = list.find((c) => c.id === id && c.user_id === userId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  // Create a new competition
  async createCompetition(
    userId: string,
    data: Omit<Competition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'rounds'>,
    rounds?: RoundInput[]
  ): Promise<Competition> {
    if (!userId) throw new Error('User ID is required');

    const now = new Date().toISOString();

    if (this.isLiveSupabase() && supabase) {
      const { data: newComp, error: compError } = await supabase
        .from('competitions')
        .insert([
          {
            user_id: userId,
            name: data.name.trim(),
            organizer: data.organizer.trim(),
            status: data.status,
            registration_deadline: data.registration_deadline || null,
            registration_fee: Number(data.registration_fee) || 0,
            payment_status: data.payment_status,
            problem_statement: data.problem_statement || '',
            result: data.result || 'Pending',
            position: data.position || '',
            prize: data.prize || '',
            result_notes: data.result_notes || '',
            competition_url: data.competition_url || '',
            github_url: data.github_url || '',
            linkedin_url: data.linkedin_url || '',
          },
        ])
        .select()
        .single();

      if (compError || !newComp) {
        console.error('Supabase create error:', compError);
        throw new Error(compError?.message || 'Failed to create competition');
      }

      let createdRounds: Round[] = [];
      if (rounds && rounds.length > 0) {
        const roundsToInsert = rounds.map((r, index) => ({
          competition_id: newComp.id,
          name: r.name.trim(),
          date: r.date || null,
          status: r.status,
          round_order: index + 1,
        }));

        const { data: insertedRounds, error: rError } = await supabase
          .from('rounds')
          .insert(roundsToInsert)
          .select();

        if (!rError && insertedRounds) {
          createdRounds = insertedRounds;
        }
      }

      return {
        ...newComp,
        rounds: createdRounds,
      };
    }

    // Local Storage mode
    const compId = 'comp_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const createdRounds: Round[] = (rounds || []).map((r, index) => ({
      id: r.id || 'round_' + Math.random().toString(36).substring(2, 9) + '_' + (index + 1),
      competition_id: compId,
      name: r.name.trim(),
      date: r.date || null,
      status: r.status,
      round_order: index + 1,
      created_at: now,
    }));

    const newCompetition: Competition = {
      id: compId,
      user_id: userId,
      name: data.name.trim(),
      organizer: data.organizer.trim(),
      status: data.status,
      registration_deadline: data.registration_deadline || null,
      registration_fee: Number(data.registration_fee) || 0,
      payment_status: data.payment_status,
      problem_statement: data.problem_statement || '',
      result: data.result || 'Pending',
      position: data.position || '',
      prize: data.prize || '',
      result_notes: data.result_notes || '',
      competition_url: data.competition_url || '',
      github_url: data.github_url || '',
      linkedin_url: data.linkedin_url || '',
      rounds: createdRounds,
      created_at: now,
      updated_at: now,
    };

    const currentList = getLocalCompetitions(userId);
    currentList.unshift(newCompetition);
    saveLocalCompetitions(userId, currentList);

    return newCompetition;
  },

  // Update an existing competition
  async updateCompetition(
    userId: string,
    id: string,
    data: Partial<Omit<Competition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'rounds'>>,
    rounds?: RoundInput[]
  ): Promise<Competition> {
    if (!userId || !id) throw new Error('User ID and Competition ID are required');

    const now = new Date().toISOString();

    if (this.isLiveSupabase() && supabase) {
      const { data: updatedComp, error: compError } = await supabase
        .from('competitions')
        .update({
          ...data,
          updated_at: now,
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (compError || !updatedComp) {
        throw new Error(compError?.message || 'Failed to update competition');
      }

      let currentRounds: Round[] = [];
      if (rounds !== undefined) {
        // Delete existing rounds and insert the updated list
        await supabase.from('rounds').delete().eq('competition_id', id);

        if (rounds.length > 0) {
          const roundsToInsert = rounds.map((r, index) => ({
            competition_id: id,
            name: r.name.trim(),
            date: r.date || null,
            status: r.status,
            round_order: index + 1,
          }));

          const { data: insertedRounds } = await supabase
            .from('rounds')
            .insert(roundsToInsert)
            .select();

          currentRounds = insertedRounds || [];
        }
      }

      return {
        ...updatedComp,
        rounds: currentRounds,
      };
    }

    // Local Storage mode
    const currentList = getLocalCompetitions(userId);
    const index = currentList.findIndex((c) => c.id === id && c.user_id === userId);
    if (index === -1) {
      throw new Error('Competition not found or access denied');
    }

    let updatedRounds: Round[] = currentList[index].rounds || [];
    if (rounds !== undefined) {
      updatedRounds = rounds.map((r, idx) => ({
        id: (r as Round).id || 'round_' + Math.random().toString(36).substring(2, 9) + '_' + (idx + 1),
        competition_id: id,
        name: r.name.trim(),
        date: r.date || null,
        status: r.status,
        round_order: idx + 1,
        created_at: (r as Round).created_at || now,
      }));
    }

    const updated: Competition = {
      ...currentList[index],
      ...data,
      rounds: updatedRounds,
      updated_at: now,
    };

    currentList[index] = updated;
    saveLocalCompetitions(userId, currentList);

    return updated;
  },

  // Delete a competition (cascading deletes rounds)
  async deleteCompetition(userId: string, id: string): Promise<boolean> {
    if (!userId || !id) return false;

    if (this.isLiveSupabase() && supabase) {
      const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(error.message);
      }
      return true;
    }

    // Local Storage mode
    const currentList = getLocalCompetitions(userId);
    const filtered = currentList.filter((c) => !(c.id === id && c.user_id === userId));
    saveLocalCompetitions(userId, filtered);
    return true;
  },

  // Calculate statistics for dashboard
  calculateStats(competitions: Competition[]): DashboardStats {
    let ongoing = 0;
    let completed = 0;
    let wins = 0;
    let finalists = 0;
    let upcomingDeadlines = 0;
    let totalFeesPaid = 0;

    const now = Date.now();

    competitions.forEach((comp) => {
      if (comp.status === 'Ongoing') ongoing++;
      if (comp.status === 'Completed') completed++;
      if (comp.result === 'Winner') wins++;
      if (comp.result === 'Finalist') finalists++;

      if (comp.payment_status === 'Paid') {
        totalFeesPaid += Number(comp.registration_fee) || 0;
      }

      if (comp.registration_deadline) {
        const deadlineTime = new Date(comp.registration_deadline).getTime();
        if (!isNaN(deadlineTime) && deadlineTime > now) {
          upcomingDeadlines++;
        }
      }
    });

    return {
      totalCompetitions: competitions.length,
      ongoingCompetitions: ongoing,
      completedCompetitions: completed,
      wins,
      finalists,
      upcomingDeadlines,
      totalFeesPaid,
    };
  },

  // Seed sample hackathons for demo/testing on user request
  async seedDemoCompetitions(userId: string): Promise<Competition[]> {
    const demoItems: Array<{
      data: Omit<Competition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'rounds'>;
      rounds: Array<Omit<Round, 'id' | 'competition_id' | 'created_at'>>;
    }> = [
      {
        data: {
          name: 'AQUATRONICS i2I',
          organizer: 'National Maritime Innovation Council',
          status: 'Ongoing',
          registration_deadline: new Date(Date.now() + 4.5 * 24 * 3600 * 1000).toISOString(),
          registration_fee: 500,
          payment_status: 'Paid',
          problem_statement:
            'Design and prototype an autonomous underwater sensor mesh for real-time ocean micro-plastic tracking and hyperspectral dissolved oxygen monitoring. System must transmit compressed telemetry through acoustic modems with under 2W power consumption.',
          result: 'Pending',
          position: '',
          prize: '₹1,50,000 Grand Prize',
          result_notes: 'Prototype phase cleared. Final presentation on stage.',
          competition_url: 'https://aquatronics.example.org',
          github_url: 'https://github.com/team-hacktrack/aquatronics-node',
          linkedin_url: 'https://linkedin.com/feed/update/urn:li:activity:7123456789',
        },
        rounds: [
          { name: 'Idea Submission & Abstract', date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), status: 'Completed', round_order: 1 },
          { name: 'Architecture Screening', date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), status: 'Completed', round_order: 2 },
          { name: 'Prototype Evaluation', date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(), status: 'Ongoing', round_order: 3 },
          { name: 'Final Presentation & Demo', date: new Date(Date.now() + 8 * 24 * 3600 * 1000).toISOString(), status: 'Upcoming', round_order: 4 },
        ],
      },
      {
        data: {
          name: 'Smart India AI Sprint 2026',
          organizer: 'Ministry of Electronics & IT',
          status: 'Completed',
          registration_deadline: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
          registration_fee: 0,
          payment_status: 'Not Required',
          problem_statement:
            'Build an edge-computing Computer Vision pipeline for high-throughput automated pothole detection, depth estimation, and prioritized civic road repair work orders using mobile phone cameras.',
          result: 'Winner',
          position: '1st Place',
          prize: '₹1,00,000 + Incubation Grant',
          result_notes: 'Secured 1st place among 450+ national finalist teams.',
          competition_url: 'https://sprint.meity.gov.in',
          github_url: 'https://github.com/team-hacktrack/roadvision-ai',
          linkedin_url: 'https://linkedin.com/posts/hacktrack-victory-smart-india',
        },
        rounds: [
          { name: 'Proposal Round', date: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(), status: 'Completed', round_order: 1 },
          { name: 'Regional Hackathon', date: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(), status: 'Completed', round_order: 2 },
          { name: 'Grand Finale 36h Sprint', date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(), status: 'Completed', round_order: 3 },
        ],
      },
      {
        data: {
          name: 'Global FinTech Defiathon',
          organizer: 'Ethereum Foundation & Devfolio',
          status: 'Upcoming',
          registration_deadline: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString(),
          registration_fee: 1000,
          payment_status: 'Not Paid',
          problem_statement:
            'Develop a zero-knowledge verifiable payment splitter for decentralized gig-economy collectives with automated local tax withholding and privacy-preserving invoice factoring.',
          result: 'Pending',
          position: '',
          prize: '$15,000 USD Pool',
          result_notes: '',
          competition_url: 'https://ethglobal.com/events',
          github_url: 'https://github.com/team-hacktrack/zk-splitter',
          linkedin_url: '',
        },
        rounds: [
          { name: 'Registration & Team Formation', date: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString(), status: 'Upcoming', round_order: 1 },
          { name: 'Buidl Week Hackathon', date: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString(), status: 'Upcoming', round_order: 2 },
          { name: 'Judge Showcase', date: new Date(Date.now() + 24 * 24 * 3600 * 1000).toISOString(), status: 'Upcoming', round_order: 3 },
        ],
      },
    ];

    const results: Competition[] = [];
    for (const item of demoItems) {
      const created = await this.createCompetition(userId, item.data, item.rounds);
      results.push(created);
    }
    return results;
  },

  // Import competitions from a previously exported JSON file (merges with existing data)
  async importCompetitions(userId: string, competitions: Competition[]): Promise<number> {
    if (!userId) throw new Error('User ID is required');
    if (!Array.isArray(competitions)) throw new Error('Invalid import file: expected an array of competitions');

    let importedCount = 0;

    for (const comp of competitions) {
      if (!comp || typeof comp.name !== 'string' || !comp.name.trim()) {
        continue; // skip malformed entries
      }

      const rounds: RoundInput[] = Array.isArray(comp.rounds)
        ? comp.rounds.map((r) => ({
            name: r.name,
            date: r.date ?? null,
            status: r.status,
          }))
        : [];

      await this.createCompetition(
        userId,
        {
          name: comp.name,
          organizer: comp.organizer || '',
          status: comp.status || 'Upcoming',
          registration_deadline: comp.registration_deadline ?? null,
          registration_fee: Number(comp.registration_fee) || 0,
          payment_status: comp.payment_status || 'Not Required',
          problem_statement: comp.problem_statement || '',
          result: comp.result || 'Pending',
          position: comp.position || '',
          prize: comp.prize || '',
          result_notes: comp.result_notes || '',
          competition_url: comp.competition_url || '',
          github_url: comp.github_url || '',
          linkedin_url: comp.linkedin_url || '',
        },
        rounds
      );
      importedCount++;
    }

    return importedCount;
  },

  // Clear all data for a specific user
  async clearUserData(userId: string): Promise<void> {
    if (!userId) return;
    if (this.isLiveSupabase() && supabase) {
      await supabase.from('competitions').delete().eq('user_id', userId);
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}competitions_${userId}`);
    }
  },
};
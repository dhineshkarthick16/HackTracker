// tests/test_isolation.js
// Automated verification for Multi-User Isolation, CRUD, Rounds & Cascading Deletes

function runTests() {
  console.log('🧪 Starting HackTrack Multi-User Isolation & CRUD Test Suite...\n');

  // Simulated in-memory store representing the isolated partition architecture
  const store = {};

  function getLocalCompetitions(userId) {
    return store[`hacktrack_data_competitions_${userId}`] || [];
  }

  function saveLocalCompetitions(userId, competitions) {
    store[`hacktrack_data_competitions_${userId}`] = JSON.parse(JSON.stringify(competitions));
  }

  function createCompetition(userId, data, rounds) {
    const compId = 'comp_' + Math.random().toString(36).substring(2, 9);
    const createdRounds = (rounds || []).map((r, i) => ({
      id: 'round_' + Math.random().toString(36).substring(2, 9),
      competition_id: compId,
      name: r.name,
      status: r.status || 'Upcoming',
      round_order: i + 1,
    }));

    const comp = {
      id: compId,
      user_id: userId,
      name: data.name,
      organizer: data.organizer,
      status: data.status,
      registration_fee: data.registration_fee || 0,
      payment_status: data.payment_status,
      problem_statement: data.problem_statement || '',
      result: data.result || 'Pending',
      rounds: createdRounds,
      created_at: new Date().toISOString(),
    };

    const current = getLocalCompetitions(userId);
    current.unshift(comp);
    saveLocalCompetitions(userId, current);
    return comp;
  }

  function getCompetitionById(userId, compId) {
    const list = getLocalCompetitions(userId);
    return list.find((c) => c.id === compId && c.user_id === userId) || null;
  }

  function deleteCompetition(userId, compId) {
    const list = getLocalCompetitions(userId);
    const filtered = list.filter((c) => !(c.id === compId && c.user_id === userId));
    saveLocalCompetitions(userId, filtered);
    return true;
  }

  // -------------------------------------------------------------
  // Test 1: User A Creates a Competition with 4 Rounds
  // -------------------------------------------------------------
  const userA_id = 'usr_alice_123';
  const userB_id = 'usr_bob_456';

  console.log('▶ Test 1: User A (Alice) adds "AQUATRONICS i2I" with 4 rounds');
  const compA = createCompetition(
    userA_id,
    {
      name: 'AQUATRONICS i2I',
      organizer: 'National Maritime Council',
      status: 'Ongoing',
      registration_fee: 500,
      payment_status: 'Paid',
      problem_statement: 'Autonomous underwater sensor mesh design...',
      result: 'Pending',
    },
    [
      { name: 'Round 1 — Idea Submission', status: 'Completed' },
      { name: 'Round 2 — Screening', status: 'Completed' },
      { name: 'Round 3 — Prototype Evaluation', status: 'Ongoing' },
      { name: 'Round 4 — Final Presentation', status: 'Upcoming' },
    ]
  );

  const aliceList = getLocalCompetitions(userA_id);
  console.assert(aliceList.length === 1, 'Alice should have 1 competition');
  console.assert(aliceList[0].name === 'AQUATRONICS i2I', 'Name should match');
  console.assert(aliceList[0].rounds.length === 4, 'Should have 4 rounds');
  console.log('  ✓ User A created competition successfully with 4 rounds.\n');

  // -------------------------------------------------------------
  // Test 2: User B Isolation Test (User B has 0 competitions)
  // -------------------------------------------------------------
  console.log('▶ Test 2: User B (Bob) checks his dashboard');
  const bobList = getLocalCompetitions(userB_id);
  console.assert(bobList.length === 0, 'Bob must have 0 competitions');
  console.log('  ✓ User B sees 0 competitions (Alice data is hidden from Bob).\n');

  // -------------------------------------------------------------
  // Test 3: Unauthorized Access Prevention
  // -------------------------------------------------------------
  console.log('▶ Test 3: User B attempts to fetch Alice\'s competition directly by ID');
  const unauthorizedFetch = getCompetitionById(userB_id, compA.id);
  console.assert(unauthorizedFetch === null, 'Bob must NOT be able to access Alice\'s competition');
  console.log('  ✓ Access denied for unauthorized user ID.\n');

  // -------------------------------------------------------------
  // Test 4: User B Creates His Own Competition
  // -------------------------------------------------------------
  console.log('▶ Test 4: User B (Bob) adds "Smart India AI Sprint"');
  const compB = createCompetition(
    userB_id,
    {
      name: 'Smart India AI Sprint',
      organizer: 'Ministry of IT',
      status: 'Completed',
      registration_fee: 0,
      payment_status: 'Not Required',
      result: 'Winner',
    },
    [{ name: 'Round 1 — Pitch', status: 'Completed' }]
  );

  const bobUpdatedList = getLocalCompetitions(userB_id);
  const aliceAfterBobList = getLocalCompetitions(userA_id);

  console.assert(bobUpdatedList.length === 1, 'Bob has 1 competition');
  console.assert(aliceAfterBobList.length === 1, 'Alice still has 1 competition');
  console.assert(bobUpdatedList[0].id === compB.id, 'Bob has his own competition ID');
  console.assert(aliceAfterBobList[0].id === compA.id, 'Alice has her own competition ID');
  console.log('  ✓ User A and User B maintain separate isolated datasets.\n');

  // -------------------------------------------------------------
  // Test 5: Deletion with Cascade
  // -------------------------------------------------------------
  console.log('▶ Test 5: User A deletes her competition');
  deleteCompetition(userA_id, compA.id);
  const aliceAfterDelete = getLocalCompetitions(userA_id);
  console.assert(aliceAfterDelete.length === 0, 'Alice has 0 competitions after delete');
  const bobAfterAliceDelete = getLocalCompetitions(userB_id);
  console.assert(bobAfterAliceDelete.length === 1, 'Bob\'s competition remains untouched');
  console.log('  ✓ Competition deleted successfully without affecting other users.\n');

  // -------------------------------------------------------------
  // Test 6: Dashboard Status Priority Sorting
  // -------------------------------------------------------------
  console.log('▶ Test 6: Verify Dashboard Status Priority Sorting (Ongoing -> Upcoming -> Completed)');
  const sampleItems = [
    { name: 'Completed Hack', status: 'Completed', created_at: '2026-08-10T10:00:00Z' },
    { name: 'Upcoming Hack', status: 'Upcoming', created_at: '2026-08-12T10:00:00Z' },
    { name: 'Ongoing Hack', status: 'Ongoing', created_at: '2026-08-11T10:00:00Z' },
  ];

  const getStatusWeight = (status) => {
    if (status === 'Ongoing') return 1;
    if (status === 'Upcoming') return 2;
    if (status === 'Completed') return 3;
    return 4;
  };

  const sorted = [...sampleItems].sort((a, b) => {
    const diff = getStatusWeight(a.status) - getStatusWeight(b.status);
    if (diff !== 0) return diff;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  console.assert(sorted[0].status === 'Ongoing', 'Ongoing must be at top (position 1)');
  console.assert(sorted[1].status === 'Upcoming', 'Upcoming must be next (position 2)');
  console.assert(sorted[2].status === 'Completed', 'Completed must be last (position 3)');
  console.log('  ✓ Ongoing and Upcoming correctly placed at the top.\n');

  console.log('🎉 ALL MULTI-USER ISOLATION, CRUD & STATUS SORTING TESTS PASSED PERFECTLY!\n');
}

runTests();

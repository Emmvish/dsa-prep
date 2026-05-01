// Interview Roadmap
// Must Know: core patterns asked most frequently.
// Medium: important follow-ups and deeper graph/tree practice.
// Advanced: specialized patterns and design-style snippets.

// =========================
// Must Know - Dynamic Programming
// =========================

// Problem: Max money from non-adjacent houses.
// Steps: track best up to i-2 and i-1; for each house pick rob vs skip; return final best.
function houseRobber(nums) {
  let prev2 = 0;
  let prev1 = 0;

  for (const n of nums) {
    const curr = Math.max(prev1, prev2 + n);
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// Problem: Minimum number of coins to make target amount.
// Steps: dp[a] = min coins for amount a; transition from a-coin; unreachable stays Infinity.
function coinChangeMin(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (a - coin >= 0) {
        dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// Problem: Count combinations to form amount using unlimited coins.
// Steps: iterate coins outside to avoid permutations; add ways from dp[a-coin] to dp[a].
function coinChangeWays(coins, amount) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;

  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) {
      dp[a] += dp[a - coin];
    }
  }

  return dp[amount];
}

// Problem: Maximum profit by cutting rod into pieces.
// Steps: dp[i] stores best for length i; try first cut j and combine with dp[i-j].
function rodCuttingMaxProfit(prices, n) {
  const dp = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= i; j++) {
      dp[i] = Math.max(dp[i], prices[j] + dp[i - j]);
    }
  }

  return dp[n];
}

// Problem: Length of longest common subsequence of two strings.
// Steps: build 2D dp; if chars match take diagonal+1 else max(top,left).
function LCS(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = 1 + dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// Problem: Return nth Fibonacci number.
// Steps: tabulate from base cases 0,1 up to n.
function fibonacciWithDP(n) {
  if (n <= 1) return n;

  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

// Problem: Fibonacci with O(1) extra space.
// Steps: keep last two values only and roll forward.
function fibonacciSpaceOptimized(n) {
  if (n <= 1) return n;

  let prev2 = 0;
  let prev1 = 1;

  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// Problem: Check if string can be segmented using dictionary words.
// Steps: dp[i] true if some j<i has dp[j] and s[j..i) in set.
function wordBreak(s, wordDict) {
  const set = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && set.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }

  return dp[s.length];
}

// Problem: Minimum assignment cost for n workers and n jobs.
// Steps: DFS by worker index; bitmask used jobs; memoize states.
function assignJobs(cost) {
  const n = cost.length;
  const dp = new Map();

  function dfs(i, mask) {
    if (i === n) return 0;

    const key = `${i}-${mask}`;
    if (dp.has(key)) return dp.get(key);

    let res = Infinity;
    for (let j = 0; j < n; j++) {
      if (!(mask & (1 << j))) {
        res = Math.min(res, cost[i][j] + dfs(i + 1, mask | (1 << j)));
      }
    }

    dp.set(key, res);
    return res;
  }

  return dfs(0, 0);
}

// =========================
// Must Know - Backtracking
// =========================

// Problem: Generate all subsets of distinct numbers.
// Steps: add current path; choose next index; backtrack after recursion.
function subsets(nums) {
  const res = [];

  function backtrack(start, path) {
    res.push([...path]);

    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  }

  backtrack(0, []);
  return res;
}

// Problem: Generate all permutations of a string.
// Steps: fix one position at a time via swaps; recurse; swap back.
function permutations(str) {
  const results = [];

  function backtrack(start = 0, arr = str.split("")) {
    if (start === arr.length) {
      results.push(arr.join(""));
      return;
    }

    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      backtrack(start + 1, arr);
      [arr[i], arr[start]] = [arr[start], arr[i]];
    }
  }

  backtrack();
  return [...new Set(results)];
}

// =========================
// Must Know - Sliding Window and Prefix Sum
// =========================

// Problem: Smallest substring of s containing all chars of t.
// Steps: expand right to satisfy counts; shrink left while valid; track best window.
function minWindow(s, t) {
  if (t.length > s.length) return "";

  const need = new Map();
  for (const ch of t) {
    need.set(ch, (need.get(ch) || 0) + 1);
  }

  const window = new Map();
  const needKinds = need.size;
  let haveKinds = 0;
  let left = 0;
  let minLength = Infinity;
  let answer = "";

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    window.set(ch, (window.get(ch) || 0) + 1);

    if (need.has(ch) && window.get(ch) === need.get(ch)) {
      haveKinds++;
    }

    while (haveKinds === needKinds) {
      const windowLen = right - left + 1;
      if (windowLen < minLength) {
        minLength = windowLen;
        answer = s.slice(left, right + 1);
      }

      const leftChar = s[left];
      window.set(leftChar, window.get(leftChar) - 1);
      if (need.has(leftChar) && window.get(leftChar) < need.get(leftChar)) {
        haveKinds--;
      }
      left++;
    }
  }

  return answer;
}

// Problem: Count subarrays whose sum equals k.
// Steps: keep prefixSum frequency; add freq[prefix-k] for each new prefix.
function subArraySumK(A, k) {
  let count = 0;
  let prefixSum = 0;
  const map = new Map();
  map.set(0, 1);

  for (const n of A) {
    prefixSum += n;

    if (map.has(prefixSum - k)) {
      count += map.get(prefixSum - k);
    }

    map.set(prefixSum, (map.get(prefixSum) || 0) + 1);
  }

  return count;
}

// =========================
// Must Know - Binary Search Patterns
// =========================

// Problem: Find target index in sorted array recursively.
// Steps: compare mid; recurse left or right; stop when range is invalid.
function binarySearch(A, x, l, r) {
  if (l > r) return false;

  const mid = Math.floor((l + r) / 2);
  if (A[mid] === x) return mid;
  if (x < A[mid]) return binarySearch(A, x, l, mid - 1);
  return binarySearch(A, x, mid + 1, r);
}

// Problem: First index of target in sorted array with duplicates.
// Steps: standard binary search; on match save mid and keep searching left.
function firstOccurrence(A, target) {
  let l = 0;
  let r = A.length - 1;
  let res = -1;

  while (l <= r) {
    const mid = Math.floor((l + r) / 2);

    if (A[mid] === target) {
      res = mid;
      r = mid - 1;
    } else if (A[mid] < target) {
      l = mid + 1;
    } else {
      r = mid - 1;
    }
  }

  return res;
}

// Problem: Find target in rotated sorted array.
// Steps: detect sorted half each iteration; keep half where target can exist.
function searchRotated(A, target) {
  let l = 0;
  let r = A.length - 1;

  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (A[mid] === target) return mid;

    if (A[l] <= A[mid]) {
      if (A[l] <= target && target < A[mid]) {
        r = mid - 1;
      } else {
        l = mid + 1;
      }
    } else {
      if (A[mid] < target && target <= A[r]) {
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }
  }

  return -1;
}

// Problem: Minimum ship capacity to deliver packages within days.
// Steps: binary search capacity; feasibility check simulates day partition.
function shipWithinDays(weights, days) {
  let low = Math.max(...weights);
  let high = weights.reduce((a, b) => a + b, 0);

  function canShip(capacity) {
    let d = 1;
    let curr = 0;

    for (const w of weights) {
      if (curr + w > capacity) {
        d++;
        curr = 0;
      }
      curr += w;
    }

    return d <= days;
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (canShip(mid)) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return low;
}

// Problem: Minimum operations to nullify all stock levels.
// Steps: binary search answer T; backward simulation verifies if first T ops suffice.
function minOperationsToNull(stockLevel, operations) {
  const n = stockLevel.length;

  function canFinish(T) {
    const last = new Map();

    for (let t = 0; t < T; t++) {
      const idx = operations[t] - 1;
      last.set(idx, t);
    }

    if (last.size < n) return false;

    let freeOps = 0;

    for (let t = T - 1; t >= 0; t--) {
      const idx = operations[t] - 1;
      if (last.get(idx) === t) {
        if (freeOps < stockLevel[idx]) return false;
        freeOps -= stockLevel[idx];
      } else {
        freeOps++;
      }
    }

    return true;
  }

  let low = 1;
  let high = operations.length;
  let ans = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (canFinish(mid)) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return ans;
}

// =========================
// Must Know - Arrays, Sorting, and Intervals
// =========================

// Problem: Best profit from one stock buy and one sell.
// Steps: track running minimum price; update max profit with current price.
const buySellStocks = (prices) => {
  let minPrice = prices[0];
  let maxProfit = prices[1] - prices[0];

  for (let i = 0; i < prices.length; i++) {
    maxProfit = Math.max(prices[i] - minPrice, maxProfit);
    minPrice = Math.min(minPrice, prices[i]);
  }

  return maxProfit;
};

// Problem: Merge overlapping closed intervals.
// Steps: sort by start; compare with last merged interval; extend or append.
function mergeIntervals(intervals) {
  intervals = intervals.sort((a, b) => a[0] - b[0]);
  const results = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = results[results.length - 1];
    if (intervals[i][0] <= last[1]) {
      results[results.length - 1] = [last[0], Math.max(last[1], intervals[i][1])];
    } else {
      results.push(intervals[i]);
    }
  }

  return results;
}

// Problem: Sort array using merge sort.
// Steps: split recursively; merge two sorted halves using two pointers.
function merge(L, R) {
  const A = [];
  let i = 0;
  let j = 0;

  while (i < L.length && j < R.length) {
    if (L[i] <= R[j]) {
      A.push(L[i]);
      i++;
    } else {
      A.push(R[j]);
      j++;
    }
  }

  while (i < L.length) {
    A.push(L[i]);
    i++;
  }

  while (j < R.length) {
    A.push(R[j]);
    j++;
  }

  return A;
}

function mergeSort(A) {
  if (A.length <= 1) return A;

  const mid = Math.floor(A.length / 2);
  const L = mergeSort(A.slice(0, mid));
  const R = mergeSort(A.slice(mid));
  return merge(L, R);
}

// Problem: Sort non-negative integers when value range is small.
// Steps: count each value frequency, then rebuild sorted result from counts.
function countingSort(A) {
  const maxIndex = Math.max(...A);
  const C = Array.from({ length: maxIndex + 1 }).fill(0);

  for (let i = 0; i < A.length; i++) {
    C[A[i]]++;
  }

  const sorted = [];
  for (let i = 0; i < C.length; i++) {
    while (C[i] > 0) {
      sorted.push(i);
      C[i]--;
    }
  }

  return sorted;
}

// Problem: Return all elements in matrix spiral order.
// Steps: keep four boundaries; print top, right, bottom, left; tighten bounds.
function spiralTraversal2D(A) {
  const out = [];
  let left = 0;
  let top = 0;
  let right = A[0].length - 1;
  let bottom = A.length - 1;

  while (left <= right && top <= bottom) {
    for (let col = left; col <= right; col++) out.push(A[top][col]);
    top++;

    for (let row = top; row <= bottom; row++) out.push(A[row][right]);
    right--;

    if (top <= bottom) {
      for (let col = right; col >= left; col--) out.push(A[bottom][col]);
      bottom--;
    }

    if (left <= right) {
      for (let row = bottom; row >= top; row--) out.push(A[row][left]);
      left++;
    }
  }

  return out;
}

// Problem: Convert number in [1,100] to English words.
// Steps: handle one-digit, teens, tens, and 100 as separate cases.
const X = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const Y = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const Z = ["twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function numToStr(n) {
  if (n < 1 || n > 100) {
    throw new Error("Input out of supported range");
  }

  if (n === 100) return "hundred";
  if (n <= 9) return X[n - 1];
  if (n <= 19) return Y[n - 10];

  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (ones === 0) return Z[tens - 2];
  return `${Z[tens - 2]} ${X[ones - 1]}`;
}

// Problem: Smallest angle between hour and minute hands.
// Steps: compute both absolute hand angles; return min(diff, 360-diff).
function findClockAngle(h, m) {
  h = h % 12;
  const hourAngle = h * 30 + m * 0.5;
  const minuteAngle = m * 6;
  const diffAngle = Math.abs(hourAngle - minuteAngle);
  return Math.min(360 - diffAngle, diffAngle);
}

// =========================
// Must Know - Hash Map and Heap
// =========================

// Problem: Return indices of two numbers that add to target.
// Steps: store seen value->index; for each value check if complement exists.
function twoSum(A, s) {
  const map = new Map();

  for (let i = 0; i < A.length; i++) {
    if (map.has(s - A[i])) {
      return [map.get(s - A[i]), i];
    }
    map.set(A[i], i);
  }

  return false;
}

// Problem: Return k most frequent characters in string.
// Steps: count frequencies; keep size-k min-heap; output heap values by freq desc.
class MinHeapTopK {
  constructor() {
    this.heap = [];
  }

  parent(idx) {
    return Math.floor((idx - 1) / 2);
  }

  leftChild(idx) {
    return 2 * idx + 1;
  }

  rightChild(idx) {
    return 2 * idx + 2;
  }

  insert(e) {
    this.heap.push(e);
    this.bubbleUp();
  }

  bubbleUp() {
    let idx = this.heap.length - 1;

    while (this.parent(idx) >= 0 && this.heap[idx][1] < this.heap[this.parent(idx)][1]) {
      [this.heap[idx], this.heap[this.parent(idx)]] = [this.heap[this.parent(idx)], this.heap[idx]];
      idx = this.parent(idx);
    }
  }

  extractMin() {
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }

  bubbleDown(idx = 0) {
    while (this.leftChild(idx) < this.heap.length) {
      let smallest = idx;
      const left = this.leftChild(idx);
      const right = this.rightChild(idx);

      if (left < this.heap.length && this.heap[left][1] < this.heap[smallest][1]) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right][1] < this.heap[smallest][1]) {
        smallest = right;
      }

      if (smallest === idx) break;
      [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
      idx = smallest;
    }
  }
}

function topKElements(str, k) {
  const freqMap = new Map();
  for (const ch of str) {
    freqMap.set(ch, (freqMap.get(ch) || 0) + 1);
  }

  const H = new MinHeapTopK();
  for (const e of freqMap.entries()) {
    H.insert(e);
    if (H.heap.length > k) {
      H.extractMin();
    }
  }

  return H.heap.sort((a, b) => b[1] - a[1]).map((e) => e[0]);
}

// =========================
// Must Know - Linked List Pattern
// =========================

// Problem: Reverse a singly linked list in-place.
// Steps: iterate nodes; redirect next to previous; advance pointers.
class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  append(val) {
    const newNode = new ListNode(val);
    if (!this.head) {
      this.head = newNode;
      return;
    }

    let curr = this.head;
    while (curr.next) {
      curr = curr.next;
    }
    curr.next = newNode;
  }

  fromArray(arr) {
    for (const val of arr) {
      this.append(val);
    }
  }

  print() {
    let curr = this.head;
    const res = [];

    while (curr) {
      res.push(curr.val);
      curr = curr.next;
    }

    console.log(res.join(" -> "));
  }

  reverse() {
    let prev = null;
    let curr = this.head;

    while (curr) {
      const nextTemp = curr.next;
      curr.next = prev;
      prev = curr;
      curr = nextTemp;
    }

    this.head = prev;
  }
}

// Problem: Detect cycle in singly linked list.
// Steps: move slow by 1 and fast by 2; meeting point means cycle exists.
function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }

  return false;
}

// Problem: Reverse nodes in groups of size k.
// Steps: find kth node; reverse current block; connect previous and next parts.
class ListNodeK {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

class LinkedListKGroup {
  constructor() {
    this.head = null;
  }

  fromArray(arr) {
    const dummy = new ListNodeK(0);
    let curr = dummy;

    for (const val of arr) {
      curr.next = new ListNodeK(val);
      curr = curr.next;
    }

    this.head = dummy.next;
  }

  print() {
    let curr = this.head;
    const res = [];

    while (curr) {
      res.push(curr.val);
      curr = curr.next;
    }

    console.log(res.join(" -> "));
  }

  getKthNode(curr, k) {
    while (curr && k > 0) {
      curr = curr.next;
      k--;
    }
    return curr;
  }

  reverseKGroup(k) {
    if (!this.head || k <= 1) return;

    const dummy = new ListNodeK(0);
    dummy.next = this.head;
    let groupPrev = dummy;

    while (true) {
      const kth = this.getKthNode(groupPrev, k);
      if (!kth) break;

      const groupNext = kth.next;
      let prev = groupNext;
      let curr = groupPrev.next;

      while (curr !== groupNext) {
        const nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
      }

      const temp = groupPrev.next;
      groupPrev.next = kth;
      groupPrev = temp;
    }

    this.head = dummy.next;
  }
}

// =========================
// Medium - Graph Patterns
// =========================

// Problem: Count connected land components in grid.
// Steps: scan cells; on land run DFS flood-fill to mark visited; increment count.
function numIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === 0) return;

    grid[r][c] = 0;
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 1) {
        count++;
        dfs(i, j);
      }
    }
  }

  return count;
}

// Problem: Check if destination is reachable from source in graph.
// Steps: build adjacency list; traverse via DFS or BFS with visited set.
function dfsReachable(src, dest, adj, visited = new Set()) {
  if (src === dest) return true;
  if (visited.has(src)) return false;

  visited.add(src);
  for (const child of adj[src]) {
    if (dfsReachable(child, dest, adj, visited)) return true;
  }

  return false;
}

function bfsReachable(src, dest, adj) {
  const visited = new Set();
  const queue = [src];

  while (queue.length) {
    const node = queue.shift();
    if (node === dest) return true;

    if (visited.has(node)) continue;
    visited.add(node);

    for (const child of adj[node]) {
      queue.push(child);
    }
  }

  return false;
}

function constructAdjacencyMatrix(cities, roads) {
  const adj = {};
  cities.forEach((c) => {
    adj[c] = new Set();
  });

  roads.forEach((r) => {
    adj[r[0]].add(r[1]);
    adj[r[1]].add(r[0]);
  });

  return adj;
}

function checkAccessiblitiy(src, dest, cities, roads) {
  return bfsReachable(src, dest, constructAdjacencyMatrix(cities, roads));
}

// Problem: Topological ordering of DAG nodes.
// Steps: compute indegrees; start queue with indegree 0 nodes; process neighbors.
function topoSort(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  const indegree = Array(n).fill(0);

  for (const [u, v] of edges) {
    adj[u].push(v);
    indegree[v]++;
  }

  const queue = [];
  for (let i = 0; i < n; i++) {
    if (indegree[i] === 0) queue.push(i);
  }

  const result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node);

    for (const nei of adj[node]) {
      indegree[nei]--;
      if (indegree[nei] === 0) queue.push(nei);
    }
  }

  return result.length === n ? result : [];
}

// Problem: Shortest path from source to all nodes in weighted graph.
// Steps: build adjacency; use min-heap by distance; relax edges when better path found.
class MinHeapDijkstra {
  constructor() {
    this.heap = [];
  }

  push(val) {
    this.heap.push(val);
    this.bubbleUp();
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return top;
  }

  bubbleUp() {
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[p][1] <= this.heap[i][1]) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  bubbleDown(i) {
    const n = this.heap.length;

    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;

      if (l < n && this.heap[l][1] < this.heap[smallest][1]) smallest = l;
      if (r < n && this.heap[r][1] < this.heap[smallest][1]) smallest = r;

      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }

  size() {
    return this.heap.length;
  }
}

function dijkstra(n, edges, src) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    adj[u].push([v, w]);
  }

  const dist = Array(n).fill(Infinity);
  dist[src] = 0;

  const heap = new MinHeapDijkstra();
  heap.push([src, 0]);

  while (heap.size()) {
    const [node, d] = heap.pop();
    if (d > dist[node]) continue;

    for (const [child, w] of adj[node]) {
      if (dist[node] + w < dist[child]) {
        dist[child] = dist[node] + w;
        heap.push([child, dist[child]]);
      }
    }
  }

  return dist;
}

// =========================
// Medium - Stack, Tree, and Set Structures
// =========================

// Problem: Next greater element to the right for each index.
// Steps: maintain decreasing stack of indices; pop while current is greater.
function nextGreater(A) {
  const stack = [];
  const res = Array(A.length).fill(-1);

  for (let i = 0; i < A.length; i++) {
    while (stack.length && A[i] > A[stack[stack.length - 1]]) {
      const idx = stack.pop();
      res[idx] = A[i];
    }
    stack.push(i);
  }

  return res;
}

// Problem: Support insert/search by prefix sharing.
// Steps: each char follows/creates child node; mark end for complete words.
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;

    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];
    }

    node.isEnd = true;
  }

  search(word) {
    let node = this.root;

    for (const ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }

    return node.isEnd;
  }
}

// Problem: Maintain disjoint sets with fast union/find.
// Steps: find uses path compression; union uses rank to keep trees shallow.
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x, y) {
    const px = this.find(x);
    const py = this.find(y);

    if (px === py) return false;

    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }

    return true;
  }
}

// Problem: Tree traversals and common tree utilities.
// Steps: BFS for levels; DFS variants for order; recursive checks for LCA/height/balance.
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function levelOrder(root) {
  if (!root) return [];

  const res = [];
  const queue = [root];

  while (queue.length) {
    const size = queue.length;
    const level = [];

    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    res.push(level);
  }

  return res;
}

function inorder(root) {
  const res = [];

  function dfs(node) {
    if (!node) return;
    dfs(node.left);
    res.push(node.val);
    dfs(node.right);
  }

  dfs(root);
  return res;
}

function preorder(root) {
  const res = [];

  function dfs(node) {
    if (!node) return;
    res.push(node.val);
    dfs(node.left);
    dfs(node.right);
  }

  dfs(root);
  return res;
}

function postorder(root) {
  const res = [];

  function dfs(node) {
    if (!node) return;
    dfs(node.left);
    dfs(node.right);
    res.push(node.val);
  }

  dfs(root);
  return res;
}

function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root;
  return left ? left : right;
}

function height(root) {
  if (!root) return 0;
  return 1 + Math.max(height(root.left), height(root.right));
}

function isBalanced(root) {
  function dfs(node) {
    if (!node) return 0;

    const left = dfs(node.left);
    if (left === -1) return -1;

    const right = dfs(node.right);
    if (right === -1) return -1;

    if (Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  }

  return dfs(root) !== -1;
}

// =========================
// Advanced - System Design Style Snippet
// =========================

// Problem: Per-key rate limiter with token bucket.
// Steps: lazily create bucket; refill by elapsed time; allow request if token >= 1.
function TokenBucketRateLimiter(capacity, refillRatePerSec) {
  const keyMap = new Map();

  return function rateLimit(key) {
    const now = Date.now();
    let keyBucket = keyMap.get(key);

    if (!keyBucket) {
      keyBucket = { tokens: capacity, lastRefilled: now };
      keyMap.set(key, keyBucket);
    }

    const elapsed = now - keyBucket.lastRefilled;
    const tokensToAdd = (elapsed * refillRatePerSec) / 1000;

    keyBucket.tokens = Math.min(capacity, keyBucket.tokens + tokensToAdd);
    keyBucket.lastRefilled = now;

    if (keyBucket.tokens >= 1) {
      keyBucket.tokens--;
      return true;
    }

    return false;
  };
}

// =========================
// Quick Usage Checks
// =========================

console.log(coinChangeMin([1, 3, 4], 11));
console.log(coinChangeWays([1, 2], 4));
console.log(rodCuttingMaxProfit([0, 2, 5, 7, 8], 4));
console.log(houseRobber([2, 7, 9, 3, 1]));
console.log(LCS("abcde", "ace"));
console.log(subsets([1, 2, 3]));
console.log(buySellStocks([400, 500, 200, 300, 100, 50, 600, 100]));
console.log(mergeIntervals([[1, 3], [4, 9], [2, 5], [11, 12], [10, 13]]));
console.log(spiralTraversal2D([[1, 2, 3], [4, 5, 6], [7, 8, 9]]));
console.log(numIslands([[1, 1, 0], [0, 1, 1], [1, 0, 0]]));
console.log(subArraySumK([1, 3, 5, 3, 1], 9));
console.log(twoSum([1, 3, 5, 8, 9], 10));
console.log(minWindow("ADOBECODEBANC", "ABC"));
console.log(topKElements("Manish Varma", 2));
console.log(binarySearch([1, 2, 3, 4, 5, 6, 7, 8], 3, 0, 7));
console.log(shipWithinDays([1, 2, 3, 1, 1], 4));
console.log(firstOccurrence([1, 2, 2, 3, 4], 2));
console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 0));
console.log(permutations("abcd"));
console.log(mergeSort([9, 7, 1, 2, 5, 3, 4, 0]));
console.log(numToStr(93));
console.log(findClockAngle(12, 45));
console.log(fibonacciWithDP(5));
console.log(fibonacciSpaceOptimized(5));
console.log(countingSort([1, 0, 3, 4, 7, 8, 2, 12]));
console.log(nextGreater([4, 5, 2, 10, 8]));
console.log(checkAccessiblitiy("A", "D", ["A", "B", "C", "D"], [["A", "B"], ["B", "C"], ["C", "D"]]));
console.log(topoSort(4, [[0, 1], [0, 2], [1, 3], [2, 3]]));
console.log(dijkstra(5, [[0, 1, 10], [0, 2, 5], [1, 2, 2], [1, 3, 1], [2, 1, 3], [2, 3, 9], [2, 4, 2], [3, 4, 4], [4, 3, 6]], 0));
console.log(wordBreak("leetcode", ["leet", "code"]));
console.log(assignJobs([[9, 2, 7], [6, 4, 3], [5, 8, 1]]));
console.log(minOperationsToNull([2, 1], [1, 2, 1, 1, 2]));

const cycleA = new ListNode(1);
const cycleB = new ListNode(2);
const cycleC = new ListNode(3);
cycleA.next = cycleB;
cycleB.next = cycleC;
cycleC.next = cycleA;
console.log(hasCycle(cycleA));

const trie = new Trie();
trie.insert("cat");
console.log(trie.search("cat"));
console.log(trie.search("car"));

const uf = new UnionFind(5);
console.log(uf.union(0, 1));
console.log(uf.union(1, 2));
console.log(uf.find(2));

const root = new TreeNode(3);
root.left = new TreeNode(5);
root.right = new TreeNode(1);
root.left.left = new TreeNode(6);
root.left.right = new TreeNode(2);
root.right.left = new TreeNode(0);
root.right.right = new TreeNode(8);
console.log(levelOrder(root));
console.log(inorder(root));
console.log(preorder(root));
console.log(postorder(root));
console.log(lowestCommonAncestor(root, root.left, root.right).val);
console.log(height(root));
console.log(isBalanced(root));

const limiter = TokenBucketRateLimiter(2, 1);
console.log(limiter("user-1"));
console.log(limiter("user-1"));
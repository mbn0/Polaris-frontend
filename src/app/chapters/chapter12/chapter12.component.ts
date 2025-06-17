import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface HashResult {
  algorithm: string
  input: string
  output: string
  time: number
  bits: number
}

interface PaddingDemo {
  original: string
  originalBits: number
  paddedBits: number
  paddingAdded: number
  finalLength: number
}

interface CompressionStep {
  round: number
  A: string
  B: string
  C: string
  D: string
  E: string
  F: string
  G: string
  H: string
  W: string
  K: string
  T1: string
  T2: string
}

@Component({
  selector: "app-chapter12",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chapter12.component.html",
  styleUrls: ["./chapter12.component.css"],
})
export class Chapter12Component {
  currentSection = 1
  totalSections = 9

  sections = [
    { id: 1, title: "Introduction to Hash Functions", completed: false },
    { id: 2, title: "Merkle-Damgård Construction", completed: false },
    { id: 3, title: "Compression Functions", completed: false },
    { id: 4, title: "SHA-512 Deep Dive", completed: false },
    { id: 5, title: "Modern Hash Functions", completed: false },
    { id: 6, title: "Applications", completed: false },
    { id: 7, title: "Security Analysis", completed: false },
    { id: 8, title: "Performance Benchmarking", completed: false },
    { id: 9, title: "Exercises & Summary", completed: false },
  ]

  // Section 1: Hash Function Properties
  hashInput = "Hello, World!"
  hashResults: HashResult[] = []
  avalancheInput1 = "Hello, World!"
  avalancheInput2 = "Hello, World?"
  avalancheResults: any = {}

  // Section 2: Merkle-Damgård Demonstration
  mdInput = "Cryptographic hash functions are essential"
  paddingDemo: PaddingDemo | null = null
  mdSteps: any[] = []

  // Section 3: Compression Functions
  selectedScheme = "davies-meyer"
  compressionInput = "ABCDEFGH12345678"
  compressionKey = "1234567890ABCDEF"
  compressionResult = ""

  // Section 4: SHA-512 Deep Dive
  sha512Input = "SHA-512 demonstration"
  sha512Steps: CompressionStep[] = []
  wordSchedule: string[] = []
  currentRound = 0

  // Section 5: Modern Alternatives
  modernInput = "Modern hash functions"
  modernResults: any = {}
  shakeLength = 256

  // Section 6: Applications Demo
  passwordInput = "mySecretPassword123"
  saltValue = "randomSalt456"
  hashedPassword = ""
  merkleLeaves = ["Transaction 1", "Transaction 2", "Transaction 3", "Transaction 4"]
  merkleTree: any = {}

  // Section 7: Security Analysis
  attackDemo = "original message"
  lengthExtensionDemo: any = {}
  collisionDemo: any = {}

  // Section 8: Performance Comparison
  performanceResults: any[] = []
  benchmarkRunning = false

  ngOnInit() {
    this.initializeSection(this.currentSection)
  }

  initializeSection(sectionId: number) {
    switch (sectionId) {
      case 1:
        this.demonstrateHashProperties()
        break
      case 2:
        this.demonstratePadding()
        break
      case 3:
        this.demonstrateCompressionFunctions()
        break
      case 4:
        this.demonstrateSHA512()
        break
      case 5:
        this.demonstrateModernHashes()
        break
      case 6:
        this.demonstrateApplications()
        break
      case 7:
        this.demonstrateSecurityAnalysis()
        break
      case 8:
        // Performance section - no auto-initialization
        break
      case 9:
        // Exercises section - no initialization needed
        break
    }
  }

  // Navigation Methods
  nextSection() {
    if (this.currentSection < this.totalSections) {
      this.sections[this.currentSection - 1].completed = true
      this.currentSection++
      this.initializeSection(this.currentSection)
    }
  }

  previousSection() {
    if (this.currentSection > 1) {
      this.currentSection--
      this.initializeSection(this.currentSection)
    }
  }

  goToSection(sectionId: number) {
    if (sectionId >= 1 && sectionId <= this.totalSections) {
      // Mark previous sections as completed
      for (let i = 0; i < sectionId - 1; i++) {
        this.sections[i].completed = true
      }
      this.currentSection = sectionId
      this.initializeSection(this.currentSection)
    }
  }

  // Section 1: Hash Function Properties
  demonstrateHashProperties() {
    const algorithms = ["MD5", "SHA-1", "SHA-256", "SHA-512"]
    this.hashResults = []

    algorithms.forEach((alg) => {
      const start = performance.now()
      const hash = this.computeHash(this.hashInput, alg)
      const end = performance.now()

      this.hashResults.push({
        algorithm: alg,
        input: this.hashInput,
        output: hash,
        time: end - start,
        bits: this.getHashBits(alg),
      })
    })

    this.demonstrateAvalancheEffect()
  }

  demonstrateAvalancheEffect() {
    const hash1 = this.computeHash(this.avalancheInput1, "SHA-256")
    const hash2 = this.computeHash(this.avalancheInput2, "SHA-256")

    const binaryHash1 = this.hexToBinary(hash1)
    const binaryHash2 = this.hexToBinary(hash2)

    let differentBits = 0
    for (let i = 0; i < binaryHash1.length; i++) {
      if (binaryHash1[i] !== binaryHash2[i]) {
        differentBits++
      }
    }

    this.avalancheResults = {
      input1: this.avalancheInput1,
      input2: this.avalancheInput2,
      hash1: hash1,
      hash2: hash2,
      differentBits: differentBits,
      totalBits: binaryHash1.length,
      percentage: ((differentBits / binaryHash1.length) * 100).toFixed(2),
    }
  }

  // Section 2: Merkle-Damgård Demonstration
  demonstratePadding() {
    const originalBits = this.mdInput.length * 8
    const paddingBits = this.calculatePadding(originalBits, 512)

    this.paddingDemo = {
      original: this.mdInput,
      originalBits: originalBits,
      paddedBits: originalBits + paddingBits + 64,
      paddingAdded: paddingBits,
      finalLength: Math.ceil((originalBits + paddingBits + 64) / 512) * 512,
    }

    this.demonstrateMDIteration()
  }

  demonstrateMDIteration() {
    const blocks = this.createMessageBlocks(this.mdInput)
    let H = "6a09e667f3bcc908b2fb1366ea957d3e3adec17512775099da2f590b0667322a"

    this.mdSteps = []
    blocks.forEach((block, i) => {
      const newH = this.compressionFunction(H, block)
      this.mdSteps.push({
        round: i + 1,
        input: H,
        block: block,
        output: newH,
        operation: "f(H_{i-1}, x_i)",
      })
      H = newH
    })
  }

  // Section 3: Compression Functions
  demonstrateCompressionFunctions() {
    this.updateCompressionDemo()
  }

  updateCompressionDemo() {
    const H = this.compressionInput
    const x = this.compressionKey

    switch (this.selectedScheme) {
      case "rabin":
        this.compressionResult = this.rabinScheme(H, x)
        break
      case "davies-meyer":
        this.compressionResult = this.daviesMeyerScheme(H, x)
        break
      case "miyaguchi-preneel":
        this.compressionResult = this.miyaguchiPreneelScheme(H, x)
        break
    }
  }

  // Section 4: SHA-512 Deep Dive
  demonstrateSHA512() {
    this.generateWordSchedule()
    this.simulateCompressionRounds()
  }

  generateWordSchedule() {
    // Simulate SHA-512 word schedule generation
    const message = this.sha512Input.padEnd(128, "0")
    this.wordSchedule = []

    // First 16 words from message
    for (let i = 0; i < 16; i++) {
      this.wordSchedule.push(message.substr(i * 8, 8))
    }

    // Generate remaining 64 words
    for (let i = 16; i < 80; i++) {
      const w = this.sha512WordExpansion(i)
      this.wordSchedule.push(w)
    }
  }

  simulateCompressionRounds() {
    // Simulate first 8 rounds of SHA-512
    let state = {
      A: "6a09e667f3bcc908",
      B: "bb67ae8584caa73b",
      C: "3c6ef372fe94f82b",
      D: "a54ff53a5f1d36f1",
      E: "510e527fade682d1",
      F: "9b05688c2b3e6c1f",
      G: "1f83d9abfb41bd6b",
      H: "5be0cd19137e2179",
    }

    this.sha512Steps = []
    for (let i = 0; i < 8; i++) {
      const K = this.getSHA512Constant(i)
      const W = this.wordSchedule[i] || "00000000"
      const T1 = this.calculateT1(state, W, K)
      const T2 = this.calculateT2(state)

      this.sha512Steps.push({
        round: i,
        A: state.A,
        B: state.B,
        C: state.C,
        D: state.D,
        E: state.E,
        F: state.F,
        G: state.G,
        H: state.H,
        W: W,
        K: K,
        T1: T1,
        T2: T2,
      })

      // Update state
      state = this.updateSHA512State(state, T1, T2)
    }
  }

  // Section 5: Modern Alternatives
  demonstrateModernHashes() {
    const input = this.modernInput

    this.modernResults = {
      sha3_256: this.computeHash(input, "SHA3-256"),
      blake2b: this.simulateBLAKE2(input),
      shake128: this.simulateSHAKE(input, this.shakeLength),
      comparison: this.compareModernHashes(input),
    }
  }

  // Section 6: Applications
  demonstrateApplications() {
    this.demonstratePasswordHashing()
    this.demonstrateMerkleTree()
  }

  demonstratePasswordHashing() {
    // Simulate PBKDF2 with SHA-256
    const iterations = 10000
    let hash = this.passwordInput + this.saltValue

    for (let i = 0; i < Math.min(iterations, 100); i++) {
      hash = this.computeHash(hash, "SHA-256")
    }

    this.hashedPassword = hash
  }

  demonstrateMerkleTree() {
    const leaves = this.merkleLeaves.map((leaf) => this.computeHash(leaf, "SHA-256"))

    this.merkleTree = {
      level0: leaves,
      level1: [this.computeHash(leaves[0] + leaves[1], "SHA-256"), this.computeHash(leaves[2] + leaves[3], "SHA-256")],
      root: "",
    }

    this.merkleTree.root = this.computeHash(this.merkleTree.level1[0] + this.merkleTree.level1[1], "SHA-256")
  }

  // Section 7: Security Analysis
  demonstrateSecurityAnalysis() {
    this.demonstrateLengthExtension()
    this.demonstrateCollisionResistance()
  }

  demonstrateLengthExtension() {
    const originalMessage = this.attackDemo
    const originalHash = this.computeHash(originalMessage, "SHA-256")
    const extension = "||ADMIN=TRUE"

    // Simulate length extension attack
    this.lengthExtensionDemo = {
      original: originalMessage,
      originalHash: originalHash,
      extension: extension,
      vulnerable: true,
      mitigation: "Use HMAC instead of bare hash",
      hmacResult: this.computeHMAC(originalMessage, "secretkey"),
    }
  }

  demonstrateCollisionResistance() {
    const hashSizes = [128, 256, 512]

    this.collisionDemo = {
      sizes: hashSizes.map((size) => ({
        bits: size,
        operations: Math.pow(2, size / 2),
        timeEstimate: this.estimateCollisionTime(size),
        security: size >= 256 ? "Secure" : "Vulnerable",
      })),
    }
  }

  // Section 8: Performance Benchmarking
  async runPerformanceBenchmark() {
    this.benchmarkRunning = true
    const algorithms = ["MD5", "SHA-1", "SHA-256", "SHA-512", "SHA3-256"]
    const testSizes = [1024, 10240, 102400] // 1KB, 10KB, 100KB

    this.performanceResults = []

    for (const alg of algorithms) {
      for (const size of testSizes) {
        const testData = "A".repeat(size)
        const start = performance.now()

        // Run multiple iterations for accurate timing
        for (let i = 0; i < 100; i++) {
          this.computeHash(testData, alg)
        }

        const end = performance.now()
        const avgTime = (end - start) / 100
        const throughput = size / 1024 / (avgTime / 1000) // KB/s

        this.performanceResults.push({
          algorithm: alg,
          dataSize: size,
          avgTime: avgTime.toFixed(3),
          throughput: throughput.toFixed(2),
        })

        // Allow UI to update
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    this.benchmarkRunning = false
  }

  // Utility Functions
  computeHash(input: string, algorithm: string): string {
    // Simplified hash simulation - in real implementation, use crypto libraries
    let hash = 0
    const multiplier = algorithm === "MD5" ? 31 : algorithm === "SHA-1" ? 37 : 41

    for (let i = 0; i < input.length; i++) {
      hash = (hash * multiplier + input.charCodeAt(i)) % Math.pow(2, 32)
    }

    const hexLength = this.getHashBits(algorithm) / 4
    return hash.toString(16).padStart(hexLength, "0").substr(0, hexLength)
  }

  getHashBits(algorithm: string): number {
    const bits: { [key: string]: number } = {
      MD5: 128,
      "SHA-1": 160,
      "SHA-256": 256,
      "SHA-512": 512,
      "SHA3-256": 256,
    }
    return bits[algorithm] || 256
  }

  getSecurityClass(algorithm: string): string {
    if (algorithm === "MD5") return "broken"
    if (algorithm === "SHA-1") return "deprecated"
    return "secure"
  }

  getSecurityStatus(algorithm: string): string {
    if (algorithm === "MD5") return "Broken"
    if (algorithm === "SHA-1") return "Deprecated"
    return "Secure"
  }

  getAvalancheQuality(percentage: string): string {
    const pct = Number.parseFloat(percentage)
    if (pct >= 45 && pct <= 55) return "excellent"
    if (pct >= 35 && pct <= 65) return "good"
    return "poor"
  }

  getAvalancheDescription(percentage: string): string {
    const pct = Number.parseFloat(percentage)
    if (pct >= 45 && pct <= 55) return "Excellent avalanche effect (~50%)"
    if (pct >= 35 && pct <= 65) return "Good avalanche effect"
    return "Poor avalanche effect"
  }

  getSchemeTitle(scheme: string): string {
    switch (scheme) {
      case "rabin":
        return "Rabin Scheme"
      case "davies-meyer":
        return "Davies-Meyer Scheme"
      case "miyaguchi-preneel":
        return "Miyaguchi-Preneel Scheme"
      default:
        return "Unknown Scheme"
    }
  }

  getSchemeFormula(scheme: string): string {
    switch (scheme) {
      case "rabin":
        return "f(H,x) = E(x,H)"
      case "davies-meyer":
        return "f(H,x) = E(H,x) ⊕ H"
      case "miyaguchi-preneel":
        return "f(H,x) = E(H,x) ⊕ H ⊕ x"
      default:
        return ""
    }
  }

  getSchemeProperty(scheme: string, property: string): string {
    const properties: any = {
      rabin: { security: "Medium", performance: "Fast" },
      "davies-meyer": { security: "High", performance: "Medium" },
      "miyaguchi-preneel": { security: "High", performance: "Slow" },
    }
    return properties[scheme]?.[property] || "Unknown"
  }

  hexToBinary(hex: string): string {
    return hex
      .split("")
      .map((h) => Number.parseInt(h, 16).toString(2).padStart(4, "0"))
      .join("")
  }

  calculatePadding(messageBits: number, blockSize: number): number {
    const k = blockSize - ((messageBits + 1 + 64) % blockSize)
    return k === blockSize ? 0 : k
  }

  createMessageBlocks(message: string): string[] {
    // Simplified block creation
    const blocks = []
    const paddedMessage = message + "1" + "0".repeat(55) + message.length.toString(2).padStart(64, "0")

    for (let i = 0; i < paddedMessage.length; i += 64) {
      blocks.push(paddedMessage.substr(i, 64))
    }

    return blocks
  }

  compressionFunction(H: string, block: string): string {
    // Simplified compression function
    let result = 0
    for (let i = 0; i < Math.min(H.length, block.length); i++) {
      result ^= Number.parseInt(H[i], 16) ^ Number.parseInt(block[i], 16)
    }
    return result.toString(16).padStart(H.length, "0")
  }

  rabinScheme(H: string, x: string): string {
    return `E(${H}, ${x})`
  }

  daviesMeyerScheme(H: string, x: string): string {
    const encrypted = `E(${H}, ${x})`
    return `${encrypted} ⊕ ${H}`
  }

  miyaguchiPreneelScheme(H: string, x: string): string {
    const encrypted = `E(${H}, ${x})`
    return `${encrypted} ⊕ ${H} ⊕ ${x}`
  }

  sha512WordExpansion(i: number): string {
    // Simplified word expansion
    return `W${i}`
  }

  getSHA512Constant(round: number): string {
    const constants = [
      "428a2f98d728ae22",
      "7137449123ef65cd",
      "b5c0fbcfec4d3b2f",
      "e9b5dba58189dbbc",
      "3956c25bf348b538",
      "59f111f1b605d019",
      "923f82a4af194f9b",
      "ab1c5ed5da6d8118",
    ]
    return constants[round] || "0000000000000000"
  }

  calculateT1(state: any, W: string, K: string): string {
    return `T1_${state.H}_${W}_${K}`
  }

  calculateT2(state: any): string {
    return `T2_${state.A}_${state.B}_${state.C}`
  }

  updateSHA512State(state: any, T1: string, T2: string): any {
    return {
      A: `${T1}+${T2}`,
      B: state.A,
      C: state.B,
      D: state.C,
      E: `${state.D}+${T1}`,
      F: state.E,
      G: state.F,
      H: state.G,
    }
  }

  simulateBLAKE2(input: string): string {
    return this.computeHash(input + "_BLAKE2", "SHA-256")
  }

  simulateSHAKE(input: string, length: number): string {
    const baseHash = this.computeHash(input + "_SHAKE", "SHA-256")
    const hexLength = length / 4
    return baseHash.repeat(Math.ceil(hexLength / baseHash.length)).substr(0, hexLength)
  }

  compareModernHashes(input: string): any {
    return {
      speed: { sha3: "Medium", blake2: "Fast", shake: "Medium" },
      security: { sha3: "High", blake2: "High", shake: "High" },
      flexibility: { sha3: "Medium", blake2: "High", shake: "Very High" },
    }
  }

  computeHMAC(message: string, key: string): string {
    return this.computeHash(key + message + key, "SHA-256")
  }

  estimateCollisionTime(bits: number): string {
    const operations = Math.pow(2, bits / 2)
    if (operations < 1e12) return "Seconds"
    if (operations < 1e15) return "Minutes"
    if (operations < 1e18) return "Hours"
    if (operations < 1e21) return "Days"
    if (operations < 1e24) return "Years"
    return "Millennia"
  }

  // Event Handlers
  onHashInputChange() {
    this.demonstrateHashProperties()
  }

  onAvalancheInputChange() {
    this.demonstrateAvalancheEffect()
  }

  onMDInputChange() {
    this.demonstratePadding()
  }

  onCompressionSchemeChange() {
    this.updateCompressionDemo()
  }

  onCompressionInputChange() {
    this.updateCompressionDemo()
  }

  onSHA512InputChange() {
    this.demonstrateSHA512()
  }

  onModernInputChange() {
    this.demonstrateModernHashes()
  }

  onShakeLengthChange() {
    this.demonstrateModernHashes()
  }

  onPasswordInputChange() {
    this.demonstratePasswordHashing()
  }

  onMerkleLeafChange(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.merkleLeaves[index] = input.value;
    this.demonstrateMerkleTree();
  }

  onAttackDemoChange() {
    this.demonstrateSecurityAnalysis()
  }

  stepThroughSHA512() {
    this.currentRound = (this.currentRound + 1) % this.sha512Steps.length
  }

  resetSHA512Demo() {
    this.currentRound = 0
    this.demonstrateSHA512()
  }
}


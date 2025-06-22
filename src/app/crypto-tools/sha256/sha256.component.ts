import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Clipboard } from '@angular/cdk/clipboard'
import { MatTooltipModule } from '@angular/material/tooltip'
import { sha256 } from 'js-sha256'

interface BinaryVisualization {
  inputs: string[]
  operation: string
  result: string
}

interface SHA256Step {
  stepNumber: number
  title: string
  description: string
  details?: string
  input: string
  output: string
  data?: any
  binaryVisualizations?: {
    ch?: BinaryVisualization
    maj?: BinaryVisualization
  }
}

@Component({
  selector: "app-sha256",
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: "./sha256.component.html",
  styleUrls: ["./sha256.component.css"],
})
export class Sha256Component {
  // Mathematical notation explanations
  readonly NOTATION_EXPLANATIONS = {
    SIGMA_0: 'Capital Sigma 0: ROTR(x,2) ⊕ ROTR(x,13) ⊕ ROTR(x,22)',
    SIGMA_1: 'Capital Sigma 1: ROTR(x,6) ⊕ ROTR(x,11) ⊕ ROTR(x,25)',
    SMALL_SIGMA_0: 'Small Sigma 0: ROTR(x,7) ⊕ ROTR(x,18) ⊕ (x >>> 3)',
    SMALL_SIGMA_1: 'Small Sigma 1: ROTR(x,17) ⊕ ROTR(x,19) ⊕ (x >>> 10)',
    CH: 'Choose function: (x & y) ⊕ (~x & z)',
    MAJ: 'Majority function: (x & y) ⊕ (x & z) ⊕ (y & z)'
  }

  // Input values
  inputMessage = "Hello World"
  readonly MAX_INPUT_LENGTH = 1048576 // 1MB limit
  inputError: string | null = null
  copySuccess = false

  constructor(private clipboard: Clipboard) {}

  // State
  steps: SHA256Step[] = []
  currentStep = 0
  isProcessing = false
  finalHash = ""

  // SHA-256 Constants
  private readonly K: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
    0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
    0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ]

  private readonly IV: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]

  // SHA-256 Helper Functions
  private ROTR(x: number, n: number): number {
    return ((x >>> n) | (x << (32 - n))) >>> 0
  }

  private Ch(x: number, y: number, z: number): number {
    return ((x & y) ^ (~x & z)) >>> 0
  }

  private Maj(x: number, y: number, z: number): number {
    return ((x & y) ^ (x & z) ^ (y & z)) >>> 0
  }

  private Σ0(x: number): number {
    return (this.ROTR(x, 2) ^ this.ROTR(x, 13) ^ this.ROTR(x, 22)) >>> 0
  }

  private Σ1(x: number): number {
    return (this.ROTR(x, 6) ^ this.ROTR(x, 11) ^ this.ROTR(x, 25)) >>> 0
  }

  private σ0(x: number): number {
    return (this.ROTR(x, 7) ^ this.ROTR(x, 18) ^ (x >>> 3)) >>> 0
  }

  private σ1(x: number): number {
    return (this.ROTR(x, 17) ^ this.ROTR(x, 19) ^ (x >>> 10)) >>> 0
  }

  private padMessage(msg: Uint8Array): Uint8Array {
    const len = msg.length * 8
    const k = (448 - (msg.length * 8 + 1)) % 512
    const paddingLength = Math.floor((k + 1) / 8)
    const padded = new Uint8Array(msg.length + paddingLength + 8)
    
    // Copy original message
    padded.set(msg)
    
    // Add 1 bit followed by zeros
    padded[msg.length] = 0x80

    // Add length in bits as big-endian 64-bit integer
    const view = new DataView(padded.buffer)
    const lengthInBits = BigInt(len)
    view.setBigUint64(padded.length - 8, lengthInBits, false) // false for big-endian
    
    return padded
  }

  private getBlocks(padded: Uint8Array): number[][] {
    const blocks: number[][] = []
    const view = new DataView(padded.buffer)
    
    for (let i = 0; i < padded.length; i += 64) {
      const W: number[] = []
      for (let j = 0; j < 16; j++) {
        W.push(view.getUint32(i + j * 4, false)) // false for big-endian
      }
      blocks.push(W)
    }
    return blocks
  }

  private expandSchedule(W: number[]): number[] {
    const schedule = [...W]
    for (let t = 16; t < 64; t++) {
      schedule[t] = (this.σ1(schedule[t - 2]) + schedule[t - 7] + this.σ0(schedule[t - 15]) + schedule[t - 16]) >>> 0
    }
    return schedule
  }

  private compressBlock(W: number[], H: number[]): number[] {
    let [a, b, c, d, e, f, g, h] = H

    for (let t = 0; t < 64; t++) {
      const T1 = (h + this.Σ1(e) + this.Ch(e, f, g) + this.K[t] + W[t]) >>> 0
      const T2 = (this.Σ0(a) + this.Maj(a, b, c)) >>> 0
      
      h = g
      g = f
      f = e
      e = (d + T1) >>> 0
      d = c
      c = b
      b = a
      a = (T1 + T2) >>> 0
    }

    return [
      (H[0] + a) >>> 0,
      (H[1] + b) >>> 0,
      (H[2] + c) >>> 0,
      (H[3] + d) >>> 0,
      (H[4] + e) >>> 0,
      (H[5] + f) >>> 0,
      (H[6] + g) >>> 0,
      (H[7] + h) >>> 0,
    ]
  }

  processInput(): void {
    this.inputError = null
    
    // Input validation
    if (!this.inputMessage) {
      this.inputError = "Please enter a message to hash"
      return
    }

    if (this.inputMessage.length > this.MAX_INPUT_LENGTH) {
      this.inputError = `Input too large. Maximum size is ${this.MAX_INPUT_LENGTH} characters`
      return
    }

    this.isProcessing = true
    this.steps = []
    this.currentStep = 0
    this.finalHash = ""

    try {
      this.generateSteps()
    } catch (error) {
      this.inputError = "Error processing SHA-256: " + error
    }

    this.isProcessing = false
  }

  private generateSteps(): void {
    const message = this.inputMessage
    const msgBytes = new TextEncoder().encode(message)

    // Step 1: Input message
    this.steps.push({
      stepNumber: 1,
      title: "Input Message",
      description: "Convert the input message to bytes for processing",
      details: `Message: "${message}"\nLength: ${message.length} characters\nBytes: ${msgBytes.length} bytes`,
      input: message,
      output: Array.from(msgBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" "),
      data: { msgBytes, originalLength: message.length },
    })

    // Step 2: Padding
    const padded = this.padMessage(msgBytes)
    this.steps.push({
      stepNumber: 2,
      title: "Message Padding",
      description: "Pad the message to a multiple of 512 bits",
      details: this.getPaddingInfo(msgBytes, padded),
      input: Array.from(msgBytes).map((b) => b.toString(16).padStart(2, "0")).join(" "),
      output: Array.from(padded).map((b) => b.toString(16).padStart(2, "0")).join(" "),
      data: { padded },
    })

    // Step 3: Split into blocks
    const blocks = this.getBlocks(padded)
    this.steps.push({
      stepNumber: 3,
      title: "Split into 512-bit Blocks",
      description: "Divide the padded message into 512-bit (64-byte) blocks",
      details: `Total blocks: ${blocks.length}\nEach block contains 16 32-bit words`,
      input: `${padded.length} bytes`,
      output: `${blocks.length} blocks of 16 words each`,
      data: { blocks },
    })

    // Step 4: Initialize hash values
    let H = [...this.IV]
    this.steps.push({
      stepNumber: 4,
      title: "Initialize Hash Values",
      description: "Set initial hash values (H0-H7) to SHA-256 constants",
      details: "These are the first 32 bits of the fractional parts of the square roots of the first 8 primes",
      input: "SHA-256 Initial Values",
      output: H.map((h) => h.toString(16).padStart(8, "0")).join(" "),
      data: { H: [...H] },
    })

    // Process each block
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex]

      // Step: Show current block
      this.steps.push({
        stepNumber: this.steps.length + 1,
        title: `Block ${blockIndex + 1}: Initial 16 Words`,
        description: `Process block ${blockIndex + 1} of ${blocks.length}`,
        details: `Block contains the first 16 words (W[0] to W[15]) of the message schedule`,
        input: `Block ${blockIndex + 1}`,
        output: block.map((w) => w.toString(16).padStart(8, "0")).join(" "),
        data: { block, blockIndex },
      })

      // Step: Expand message schedule
      const W = this.expandSchedule([...block])
      this.steps.push({
        stepNumber: this.steps.length + 1,
        title: `Block ${blockIndex + 1}: Expand Message Schedule`,
        description: "Expand the 16-word block into a 64-word message schedule",
        details: "For t = 16 to 63: W[t] = σ₁(W[t-2]) + W[t-7] + σ₀(W[t-15]) + W[t-16]",
        input: "16 words",
        output: "64 words",
        data: { W, blockIndex },
      })

      // Step: Initialize working variables
      let [a, b, c, d, e, f, g, h] = H
      this.steps.push({
        stepNumber: this.steps.length + 1,
        title: `Block ${blockIndex + 1}: Initialize Working Variables`,
        description: "Set working variables a-h to current hash values",
        details: `a=${a.toString(16)}, b=${b.toString(16)}, c=${c.toString(16)}, d=${d.toString(16)}\ne=${e.toString(16)}, f=${f.toString(16)}, g=${g.toString(16)}, h=${h.toString(16)}`,
        input: "Hash values H0-H7",
        output: "Working variables a-h",
        data: { workingVars: [a, b, c, d, e, f, g, h], blockIndex },
      })

      // Show key rounds (0, 15, 31, 47, 63)
      const keyRounds = [0, 15, 31, 47, 63]
      for (let t = 0; t < 64; t++) {
        const T1 = (h + this.Σ1(e) + this.Ch(e, f, g) + this.K[t] + W[t]) >>> 0
          const T2 = (this.Σ0(a) + this.Maj(a, b, c)) >>> 0

          const oldVars = [a, b, c, d, e, f, g, h]

          h = g
          g = f
          f = e
          e = (d + T1) >>> 0
          d = c
          c = b
          b = a
          a = (T1 + T2) >>> 0

        if (keyRounds.includes(t)) {
          this.steps.push({
            stepNumber: this.steps.length + 1,
            title: `Block ${blockIndex + 1}: Round ${t}`,
            description: `Compression function round ${t} of 64`,
            details: `T1 = h + Σ₁(e) + Ch(e,f,g) + K[${t}] + W[${t}]\nT2 = Σ₀(a) + Maj(a,b,c)\nUpdate: a = T1 + T2, e = d + T1, others shift`,
            input: oldVars.map((v) => v.toString(16).padStart(8, "0")).join(" "),
            output: [a, b, c, d, e, f, g, h].map((v) => v.toString(16).padStart(8, "0")).join(" "),
            data: {
              round: t,
              T1,
              T2,
              K: this.K[t],
              W: W[t],
              oldVars,
              newVars: [a, b, c, d, e, f, g, h],
              blockIndex,
            },
          })

          // Add binary visualization for compression steps
          const chVisualization = {
            inputs: [
              e.toString(2).padStart(32, "0"),
              f.toString(2).padStart(32, "0"),
              g.toString(2).padStart(32, "0"),
            ],
            operation: "Ch",
            result: this.Ch(e, f, g).toString(2).padStart(32, "0"),
          }

          const majVisualization = {
            inputs: [
              a.toString(2).padStart(32, "0"),
              b.toString(2).padStart(32, "0"),
              c.toString(2).padStart(32, "0"),
            ],
            operation: "Maj",
            result: this.Maj(a, b, c).toString(2).padStart(32, "0"),
          }

          this.steps[this.steps.length - 1].binaryVisualizations = {
            ch: chVisualization,
            maj: majVisualization,
          }
        }
      }

      // Step: Add to hash values
      const oldH = [...H]
      H = [
        (H[0] + a) >>> 0,
        (H[1] + b) >>> 0,
        (H[2] + c) >>> 0,
        (H[3] + d) >>> 0,
        (H[4] + e) >>> 0,
        (H[5] + f) >>> 0,
        (H[6] + g) >>> 0,
        (H[7] + h) >>> 0,
      ]

      this.steps.push({
        stepNumber: this.steps.length + 1,
        title: `Block ${blockIndex + 1}: Update Hash Values`,
        description: "Add working variables to hash values",
        details: `H[i] = H[i] + working_var[i] for i = 0 to 7`,
        input: oldH.map((h) => h.toString(16).padStart(8, "0")).join(" "),
        output: H.map((h) => h.toString(16).padStart(8, "0")).join(" "),
        data: { oldH, newH: [...H], blockIndex },
      })
    }

    // Verify our computation matches the library
    const libraryHash = sha256.create()
    libraryHash.update(message)
    const expectedHash = libraryHash.hex()
    const computedHash = H.map((h) => h.toString(16).padStart(8, "0")).join("")

    if (computedHash !== expectedHash) {
      console.error("Hash mismatch:", { computed: computedHash, expected: expectedHash })
    }

    // Final step: Produce final hash
    this.finalHash = computedHash
    this.steps.push({
      stepNumber: this.steps.length + 1,
      title: "Final Hash Digest",
      description: "Concatenate all hash values to produce the final SHA-256 digest",
      details: `The final 256-bit hash is represented as 64 hexadecimal characters`,
      input: "Hash values H0-H7",
      output: this.finalHash,
      data: { finalHash: this.finalHash, H },
    })
  }

  private getPaddingInfo(original: Uint8Array, padded: Uint8Array): string {
    const originalBits = original.length * 8
    const paddedBits = padded.length * 8
    const paddingBits = paddedBits - originalBits

    return `Original message: ${originalBits} bits
Padding added: ${paddingBits} bits
- 1 bit (0x80)
- ${paddingBits - 65} zero bits
- 64-bit length field (${originalBits})
Total padded length: ${paddedBits} bits (${paddedBits / 512} × 512-bit blocks)`
  }

  reset(): void {
    this.steps = []
    this.currentStep = 0
    this.finalHash = ""
    this.inputMessage = "Hello World"
  }

  goToStep(index: number): void {
    this.currentStep = index
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--
    }
  }

  getHexDisplay(data: any): string {
    if (Array.isArray(data)) {
      return data.map((item) => (typeof item === "number" ? item.toString(16).padStart(8, "0") : item)).join(" ")
    }
    return data?.toString() || ""
  }

  isCompressionRound(): boolean {
    const step = this.steps[this.currentStep]
    return step?.title.includes("Round") && step?.data?.round !== undefined
  }

  isBlockProcessing(): boolean {
    const step = this.steps[this.currentStep]
    return step?.title.includes("Block") && step?.data?.blockIndex !== undefined
  }

  getWorkingVarsDisplay(vars: number[]): string {
    const labels = ["a", "b", "c", "d", "e", "f", "g", "h"]
    return vars.map((v, i) => `${labels[i]}=${v.toString(16).padStart(8, "0")}`).join(", ")
  }

  copyToClipboard(): void {
    if (this.finalHash) {
      this.clipboard.copy(this.finalHash)
      this.copySuccess = true
      setTimeout(() => this.copySuccess = false, 2000)
    }
  }
}

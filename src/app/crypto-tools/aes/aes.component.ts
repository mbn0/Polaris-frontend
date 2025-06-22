import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface AESStep {
  stepNumber: number
  title: string
  description: string
  details?: string
  input: string
  output: string
  data?: any
}

type State = number[][]
type RoundKey = State

@Component({
  selector: "app-aes",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./aes.component.html",
  styleUrls: ["./aes.component.css"],
})
export class AESComponent {
  // Input values
  inputPlaintext = "1234567890123456"  // Default input of exactly 16 chars
  inputKey = "MySecretKey12345"

  // State
  steps: AESStep[] = []
  currentStep = 0
  isProcessing = false
  finalCiphertext = ""
  inputError = ""

  // AES Constants
  private readonly SBOX: number[] = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
  ]

  private readonly RCON: number[] = [
    0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
  ]

  // AES Helper Functions
  private toState(input: Uint8Array): State {
    const s: State = [[], [], [], []]
    for (let i = 0; i < 16; i++) {
      s[i % 4][Math.floor(i / 4)] = input[i]
    }
    return s
  }

  private fromState(s: State): Uint8Array {
    const out = new Uint8Array(16)
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        out[4 * c + r] = s[r][c]
      }
    }
    return out
  }

  private subBytes(s: State): void {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        s[r][c] = this.SBOX[s[r][c]]
      }
    }
  }

  private shiftRows(s: State): void {
    for (let r = 1; r < 4; r++) {
      s[r] = s[r].slice(r).concat(s[r].slice(0, r))
    }
  }

  private xtime(b: number): number {
    return ((b << 1) ^ ((b & 0x80) ? 0x1b : 0)) & 0xff
  }

  private gmul(b: number, factor: number): number {
    if (factor === 1) return b
    if (factor === 2) return this.xtime(b)
    if (factor === 3) return this.xtime(b) ^ b
    throw new Error('Unsupported gmul factor')
  }

  private mixColumn(col: number[]): number[] {
    const [a, b, c, d] = col
    return [
      this.gmul(a, 2) ^ this.gmul(b, 3) ^ this.gmul(c, 1) ^ this.gmul(d, 1),
      this.gmul(a, 1) ^ this.gmul(b, 2) ^ this.gmul(c, 3) ^ this.gmul(d, 1),
      this.gmul(a, 1) ^ this.gmul(b, 1) ^ this.gmul(c, 2) ^ this.gmul(d, 3),
      this.gmul(a, 3) ^ this.gmul(b, 1) ^ this.gmul(c, 1) ^ this.gmul(d, 2)
    ]
  }

  private mixColumns(s: State): void {
    for (let c = 0; c < 4; c++) {
      const col = [s[0][c], s[1][c], s[2][c], s[3][c]]
      const mixed = this.mixColumn(col)
      for (let r = 0; r < 4; r++) s[r][c] = mixed[r]
    }
  }

  private addRoundKey(s: State, rk: RoundKey): void {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        s[r][c] ^= rk[r][c]
      }
    }
  }

  private rotateWord(w: number[]): number[] {
    return w.slice(1).concat(w[0])
  }

  private subWord(w: number[]): number[] {
    return w.map(b => this.SBOX[b])
  }

  private keyExpansion(key: Uint8Array): RoundKey[] {
    const Nk = 4, Nr = 10, Nb = 4
    const w: number[][] = []

    // First Nk words from the key
    for (let i = 0; i < Nk; i++) {
      w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]]
    }

    for (let i = Nk; i < Nb * (Nr + 1); i++) {
      let temp = w[i - 1].slice()
      if (i % Nk === 0) {
        temp = this.subWord(this.rotateWord(temp))
        temp[0] ^= this.RCON[i / Nk]
      }
      w[i] = w[i - Nk].map((b, idx) => b ^ temp[idx])
    }

    // Group into RoundKey states
    const roundKeys: RoundKey[] = []
    for (let r = 0; r < Nr + 1; r++) {
      const rk: RoundKey = [[], [], [], []]
      for (let c = 0; c < Nb; c++) {
        const word = w[r * Nb + c]
        for (let row = 0; row < 4; row++) {
          rk[row][c] = word[row]
        }
      }
      roundKeys.push(rk)
    }
    return roundKeys
  }

  private padKey(input: string): Uint8Array {
    const bytes = new TextEncoder().encode(input)
    // Key must always be exactly 16 bytes
    if (bytes.length > 16) {
      throw new Error("Key must not exceed 16 bytes")
    }
    const padded = new Uint8Array(16)
    padded.set(bytes)
    // Zero padding for key (since key padding method doesn't affect security)
    padded.fill(0, bytes.length)
    return padded
  }

  private padPlaintext(input: string): Uint8Array {
    const bytes = new TextEncoder().encode(input)
    
    if (bytes.length !== 16) {
      throw new Error(`Input must be exactly 16 bytes. Current length: ${bytes.length} bytes`)
    }
    
    return bytes
  }

  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ')
  }

  processInput(): void {
    this.isProcessing = true
    this.steps = []
    this.currentStep = 0
    this.finalCiphertext = ""
    this.inputError = ""  // Reset error message

    try {
      this.generateSteps()
    } catch (error: any) {
      this.inputError = error.message || "An unknown error occurred"
      console.error("Error processing AES:", error)
    }

    this.isProcessing = false
  }

  private formatCiphertext(ciphertext: Uint8Array): string {
    // Format ciphertext in blocks of 16 bytes with detailed hex representation
    const hex = Array.from(ciphertext)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ')
    
    return `${ciphertext.length} bytes: ${hex}`
  }

  private generateSteps(): void {
    const plaintext = this.padPlaintext(this.inputPlaintext)
    const key = this.padKey(this.inputKey)

    // Step 1: Input preparation
    const plaintextHex = this.bytesToHex(plaintext)
    const keyHex = this.bytesToHex(key)
    
    this.steps.push({
      stepNumber: 1,
      title: "Input Preparation",
      description: "Convert plaintext and key to 16-byte blocks and display as 4×4 state matrices",
      details: `Plaintext: "${this.inputPlaintext}"\nHex: ${plaintextHex}\nKey: "${this.inputKey}"\nKey Hex: ${keyHex}`,
      input: `Text: ${this.inputPlaintext}, Key: ${this.inputKey}`,
      output: `Plaintext (${plaintext.length} bytes): ${plaintextHex}\nKey (${key.length} bytes): ${keyHex}`,
      data: { plaintext, key, plaintextState: this.toState(plaintext), keyState: this.toState(key) }
    })

    // Step 2: Key expansion
    const roundKeys = this.keyExpansion(key)
    this.steps.push({
      stepNumber: 2,
      title: "Key Expansion",
      description: "Generate 11 round keys (44 words total) from the original 128-bit key",
      details: `Using RotWord, SubWord, and Rcon constants to expand the key.\nEach round key is 128 bits (16 bytes) arranged as a 4×4 matrix.`,
      input: "Original 128-bit key",
      output: "11 round keys (176 bytes total)",
      data: { roundKeys, keyExpansionDetails: this.getKeyExpansionDetails(key) }
    })

    // Step 3: Initial state
    let state = this.toState(plaintext)
    this.steps.push({
      stepNumber: 3,
      title: "Initial State",
      description: "Load plaintext into the AES state matrix (4×4 bytes, filled column-wise)",
      details: `The 16-byte plaintext is arranged in a 4×4 matrix.\nBytes are filled column by column: [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15]`,
      input: "16-byte plaintext",
      output: "4×4 state matrix",
      data: { state: this.copyState(state) }
    })

    // Step 4: Initial AddRoundKey
    const initialState = this.copyState(state)
    this.addRoundKey(state, roundKeys[0])
    this.steps.push({
      stepNumber: 4,
      title: "Initial AddRoundKey",
      description: "XOR the initial state with the first round key (Round 0)",
      details: `Each byte of the state is XORed with the corresponding byte of Round Key 0.\nThis integrates the key material before the main rounds begin.`,
      input: "Initial state + Round Key 0",
      output: "State after initial key addition",
      data: { 
        beforeState: initialState, 
        afterState: this.copyState(state), 
        roundKey: this.copyState(roundKeys[0]),
        round: 0
      }
    })

    // Main rounds (1-9)
    for (let round = 1; round < 10; round++) {
      // SubBytes
      const beforeSubBytes = this.copyState(state)
      this.subBytes(state)
      this.steps.push({
        stepNumber: this.steps.length + 1,
        title: `Round ${round}: SubBytes`,
        description: "Replace each byte using the AES S-box (non-linear substitution)",
        details: `Each byte is replaced by looking it up in the S-box.\nThe S-box provides confusion and non-linearity to resist cryptanalysis.`,
        input: "State before SubBytes",
        output: "State after S-box substitution",
        data: { 
          beforeState: beforeSubBytes, 
          afterState: this.copyState(state), 
          round,
          sboxExamples: this.getSboxExamples(beforeSubBytes)
        }
      })

      // ShiftRows
      const beforeShiftRows = this.copyState(state)
      this.shiftRows(state)
      this.steps.push({
        stepNumber: this.steps.length + 1,
        title: `Round ${round}: ShiftRows`,
        description: "Cyclically shift rows left: row 0→0, row 1→1, row 2→2, row 3→3 positions",
        details: `Row 0: No shift\nRow 1: Shift left by 1\nRow 2: Shift left by 2\nRow 3: Shift left by 3\nThis provides diffusion across columns.`,
        input: "State before ShiftRows",
        output: "State after row shifting",
        data: { 
          beforeState: beforeShiftRows, 
          afterState: this.copyState(state), 
          round,
          shiftDetails: this.getShiftDetails(beforeShiftRows)
        }
      })

      // MixColumns
      const beforeMixColumns = this.copyState(state)
      this.mixColumns(state)
      this.steps.push({
        stepNumber: this.steps.length + 1,
        title: `Round ${round}: MixColumns`,
        description: "Mix each column using Galois field multiplication in GF(2⁸)",
        details: `Each column is multiplied by the matrix:\n[02 03 01 01]\n[01 02 03 01]\n[01 01 02 03]\n[03 01 01 02]\nThis provides diffusion within columns.`,
        input: "State before MixColumns",
        output: "State after column mixing",
        data: { 
          beforeState: beforeMixColumns, 
          afterState: this.copyState(state), 
          round,
          mixDetails: this.getMixColumnsDetails(beforeMixColumns)
        }
      })

      // AddRoundKey
      const beforeAddRoundKey = this.copyState(state)
      this.addRoundKey(state, roundKeys[round])
      this.steps.push({
        stepNumber: this.steps.length + 1,
        title: `Round ${round}: AddRoundKey`,
        description: `XOR state with Round Key ${round}`,
        details: `Each byte of the state is XORed with the corresponding byte of Round Key ${round}.\nThis integrates the key material for this round.`,
        input: `State + Round Key ${round}`,
        output: `State after Round ${round}`,
        data: { 
          beforeState: beforeAddRoundKey, 
          afterState: this.copyState(state), 
          roundKey: this.copyState(roundKeys[round]),
          round
        }
      })
    }

    // Final round (10)
    // SubBytes
    const beforeFinalSubBytes = this.copyState(state)
    this.subBytes(state)
    this.steps.push({
      stepNumber: this.steps.length + 1,
      title: "Final Round: SubBytes",
      description: "Final S-box substitution (no MixColumns in final round)",
      details: `The final round omits MixColumns to make decryption more efficient.\nOnly SubBytes, ShiftRows, and AddRoundKey are performed.`,
      input: "State before final SubBytes",
      output: "State after final S-box substitution",
      data: { 
        beforeState: beforeFinalSubBytes, 
        afterState: this.copyState(state), 
        round: 10,
        sboxExamples: this.getSboxExamples(beforeFinalSubBytes)
      }
    })

    // ShiftRows
    const beforeFinalShiftRows = this.copyState(state)
    this.shiftRows(state)
    this.steps.push({
      stepNumber: this.steps.length + 1,
      title: "Final Round: ShiftRows",
      description: "Final row shifting operation",
      details: `Same row shifting as previous rounds:\nRow 0: No shift, Row 1: Left 1, Row 2: Left 2, Row 3: Left 3`,
      input: "State before final ShiftRows",
      output: "State after final row shifting",
      data: { 
        beforeState: beforeFinalShiftRows, 
        afterState: this.copyState(state), 
        round: 10,
        shiftDetails: this.getShiftDetails(beforeFinalShiftRows)
      }
    })

    // Final AddRoundKey
    const beforeFinalAddRoundKey = this.copyState(state)
    this.addRoundKey(state, roundKeys[10])
    this.steps.push({
      stepNumber: this.steps.length + 1,
      title: "Final Round: AddRoundKey",
      description: "Final XOR with Round Key 10 to produce ciphertext",
      details: `The final key addition completes the AES encryption.\nThe resulting state matrix contains the encrypted data.`,
      input: `State + Round Key 10`,
      output: "Final encrypted state",
      data: { 
        beforeState: beforeFinalAddRoundKey, 
        afterState: this.copyState(state), 
        roundKey: this.copyState(roundKeys[10]),
        round: 10
      }
    })

    // Final result
    const ciphertext = this.fromState(state)
    const formattedCiphertext = this.formatCiphertext(ciphertext)
    this.finalCiphertext = formattedCiphertext

    this.steps.push({
      stepNumber: this.steps.length + 1,
      title: "Ciphertext Output",
      description: "Convert final state back to byte array - AES encryption complete",
      details: `The 4×4 state matrix is converted back to a 16-byte array.\nBytes are read column-wise to produce the final ciphertext.`,
      input: "Final state matrix",
      output: formattedCiphertext,
      data: { 
        finalState: this.copyState(state), 
        ciphertext, 
        hexOutput: formattedCiphertext
      }
    })
  }

  private copyState(state: State): State {
    return state.map(row => [...row])
  }

  private getSboxExamples(state: State): any[] {
    const examples = []
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const input = state[r][c]
        const output = this.SBOX[input]
        examples.push({ 
          position: `[${r},${c}]`, 
          input: input.toString(16).padStart(2, '0'), 
          output: output.toString(16).padStart(2, '0') 
        })
      }
    }
    return examples
  }

  private getShiftDetails(state: State): any {
    return {
      row0: { before: [...state[0]], after: [...state[0]], shift: 0 },
      row1: { before: [...state[1]], after: state[1].slice(1).concat(state[1].slice(0, 1)), shift: 1 },
      row2: { before: [...state[2]], after: state[2].slice(2).concat(state[2].slice(0, 2)), shift: 2 },
      row3: { before: [...state[3]], after: state[3].slice(3).concat(state[3].slice(0, 3)), shift: 3 }
    }
  }

  private getMixColumnsDetails(state: State): any {
    const details = []
    for (let c = 0; c < 4; c++) {
      const col = [state[0][c], state[1][c], state[2][c], state[3][c]]
      const mixed = this.mixColumn(col)
      details.push({
        column: c,
        before: col.map(b => b.toString(16).padStart(2, '0')),
        after: mixed.map(b => b.toString(16).padStart(2, '0')),
        operations: [
          `${col[0].toString(16)}⊗02 ⊕ ${col[1].toString(16)}⊗03 ⊕ ${col[2].toString(16)}⊗01 ⊕ ${col[3].toString(16)}⊗01 = ${mixed[0].toString(16)}`,
          `${col[0].toString(16)}⊗01 ⊕ ${col[1].toString(16)}⊗02 ⊕ ${col[2].toString(16)}⊗03 ⊕ ${col[3].toString(16)}⊗01 = ${mixed[1].toString(16)}`,
          `${col[0].toString(16)}⊗01 ⊕ ${col[1].toString(16)}⊗01 ⊕ ${col[2].toString(16)}⊗02 ⊕ ${col[3].toString(16)}⊗03 = ${mixed[2].toString(16)}`,
          `${col[0].toString(16)}⊗03 ⊕ ${col[1].toString(16)}⊗01 ⊕ ${col[2].toString(16)}⊗01 ⊕ ${col[3].toString(16)}⊗02 = ${mixed[3].toString(16)}`
        ]
      })
    }
    return details
  }

  private getKeyExpansionDetails(key: Uint8Array): any {
    const details = []
    const w: number[][] = []
    
    // First 4 words
    for (let i = 0; i < 4; i++) {
      w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]]
      details.push({
        word: i,
        value: w[i].map(b => b.toString(16).padStart(2, '0')).join(''),
        operation: 'Original key word'
      })
    }

    // Expansion
    for (let i = 4; i < 44; i++) {
      let temp = w[i - 1].slice()
      let operation = `W[${i-1}]`
      
      if (i % 4 === 0) {
        const rotated = this.rotateWord(temp)
        const subbed = this.subWord(rotated)
        subbed[0] ^= this.RCON[i / 4]
        temp = subbed
        operation = `SubWord(RotWord(W[${i-1}])) ⊕ Rcon[${i/4}]`
      }
      
      w[i] = w[i - 4].map((b, idx) => b ^ temp[idx])
      
      if (i < 8) { // Only show first few for brevity
        details.push({
          word: i,
          value: w[i].map(b => b.toString(16).padStart(2, '0')).join(''),
          operation: `${operation} ⊕ W[${i-4}]`
        })
      }
    }
    
    return details
  }

  reset(): void {
    this.inputPlaintext = "1234567890123456"
    this.inputKey = "MySecretKey12345"
    this.steps = []
    this.currentStep = 0
    this.finalCiphertext = ""
    this.inputError = ""
    this.isProcessing = false
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

  getStateDisplay(state: State): string {
    return state.map(row => 
      row.map(byte => byte.toString(16).padStart(2, '0')).join(' ')
    ).join('\n')
  }

  getByteArray(state: State): string {
    const bytes = []
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        bytes.push(state[r][c].toString(16).padStart(2, '0'))
      }
    }
    return bytes.join(' ')
  }

  isRoundStep(): boolean {
    const step = this.steps[this.currentStep]
    return step?.title.includes('Round') && step?.data?.round !== undefined
  }

  isKeyExpansionStep(): boolean {
    return this.steps[this.currentStep]?.title === 'Key Expansion'
  }

  isStateTransformationStep(): boolean {
    const step = this.steps[this.currentStep]
    return step?.title.includes('SubBytes') || 
           step?.title.includes('ShiftRows') || 
           step?.title.includes('MixColumns') || 
           step?.title.includes('AddRoundKey')
  }

  getCurrentStepData(): any {
    return this.steps[this.currentStep]?.data || {}
  }

  // Format byte arrays for display
  formatByteArray(bytes: number[]): string {
    return bytes.map(b => b.toString(16).padStart(2, '0')).join(', ');
  }

  // Format a single byte for display
  formatByte(byte: number): string {
    return byte.toString(16).padStart(2, '0');
  }

  // Get formatted before state from shift details
  getFormattedBeforeShift(detail: any): string {
    return detail.before.map((b: number) => b.toString(16).padStart(2, '0')).join(', ');
  }

  // Get formatted after state from shift details
  getFormattedAfterShift(detail: any): string {
    return detail.after.map((b: number) => b.toString(16).padStart(2, '0')).join(', ');
  }

  // Get mix column before value
  getMixColumnBefore(detail: any): string {
    return detail.before.join(', ');
  }

  // Get mix column after value
  getMixColumnAfter(detail: any): string {
    return detail.after.join(', ');
  }

  // Get round key display name
  getRoundKeyDisplayName(index: number): string {
    return `Round Key ${index}`;
  }
}

import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface DESStep {
  stepNumber: number
  title: string
  description: string
  input: string
  output: string
  details?: string
  roundKey?: string
}

@Component({
  selector: "app-des-tool",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./des-tool.component.html",
  styleUrls: ["./des-tool.component.css"],
})
export class DesToolComponent {
  inputText = ""
  inputKey = ""
  steps: DESStep[] = []
  isProcessing = false
  currentStep = 0
  showBinaryView = false

  // DES Tables
  private readonly IP = [
    58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24,
    16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39,
    31, 23, 15, 7,
  ]

  private readonly FP = [
    40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21,
    61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9,
    49, 17, 57, 25,
  ]

  private readonly E = [
    32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21,
    22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1,
  ]

  private readonly P = [
    16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4,
    25,
  ]

  private readonly SBOX = [
    // S1
    [
      14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7,
      0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8,
      4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0,
      15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13
    ],
    // S2
    [
      15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10,
      3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5,
      0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15,
      13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9
    ],
    // S3
    [
      10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8,
      13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1,
      13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7,
      1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12
    ],
    // S4
    [
      7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15,
      13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9,
      10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4,
      3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14
    ],
    // S5
    [
      2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9,
      14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6,
      4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14,
      11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3
    ],
    // S6
    [
      12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11,
      10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8,
      9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6,
      4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13
    ],
    // S7
    [
      4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1,
      13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6,
      1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2,
      6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12
    ],
    // S8
    [
      13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7,
      1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2,
      7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8,
      2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11
    ]
  ]

  // Add DES key schedule tables
  private readonly PC1 = [
    57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
    10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
    14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4
  ]

  private readonly PC2 = [
    14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10,
    23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2,
    41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48,
    44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32
  ]

  private readonly SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1]

  processInput(): void {
    if (!this.inputText || !this.inputKey) {
      alert("Please enter both plaintext and key")
      return
    }

    if (this.inputKey.length !== 8) {
      alert("Key must be exactly 8 characters (64 bits)")
      return
    }

    this.isProcessing = true
    this.steps = []
    this.currentStep = 0

    // Convert input to binary
    const plainBits = this.textToBinary(this.inputText.substring(0, 8).padEnd(8, "\0"))
    const keyBits = this.textToBinary(this.inputKey)

    this.performDES(plainBits, keyBits)
    this.isProcessing = false
  }

  private performDES(plainBits: number[], keyBits: number[]): void {
    // Step 1: Initial Permutation
    const ipResult = this.initialPermute(plainBits)
    this.addStep(
      1,
      "Initial Permutation (IP)",
      "Reorders the 64 input bits according to the fixed IP table",
      this.formatBits(plainBits),
      this.formatBits(ipResult),
      "The IP table spreads bits from both halves across the block to prepare for Feistel rounds",
    )

    // Split into left and right halves
    let leftHalf = ipResult.slice(0, 32)
    let rightHalf = ipResult.slice(32, 64)

    this.addStep(
      2,
      "Split into Halves",
      "Divide the 64-bit block into two 32-bit halves",
      this.formatBits(ipResult),
      `L0: ${this.formatBits(leftHalf)}, R0: ${this.formatBits(rightHalf)}`,
      "Left and right halves will be processed through 16 Feistel rounds",
    )

    // Generate subkeys (simplified - using same key for demo)
    const subkeys = this.generateSubkeys(keyBits)

    // 16 Feistel rounds
    for (let round = 1; round <= 16; round++) {
      const newLeft = rightHalf.slice()
      const fResult = this.feistelFunction(rightHalf, subkeys[round - 1])
      const newRight = leftHalf.map((bit, i) => bit ^ fResult[i])

      this.addStep(
        2 + round,
        `Round ${round}`,
        `Feistel round ${round}: L${round} = R${round - 1}, R${round} = L${round - 1} ⊕ F(R${round - 1}, K${round})`,
        `L${round - 1}: ${this.formatBits(leftHalf)}, R${round - 1}: ${this.formatBits(rightHalf)}`,
        `L${round}: ${this.formatBits(newLeft)}, R${round}: ${this.formatBits(newRight)}`,
        `F-function output: ${this.formatBits(fResult)}`,
        this.formatBits(subkeys[round - 1])
      )

      leftHalf = newLeft
      rightHalf = newRight
    }

    // Swap halves and concatenate
    const preOutput = rightHalf.concat(leftHalf)
    this.addStep(
      19,
      "Swap Halves",
      "Swap the final left and right halves before final permutation",
      `L16: ${this.formatBits(leftHalf)}, R16: ${this.formatBits(rightHalf)}`,
      this.formatBits(preOutput),
      "The halves are swapped to undo the effect of the last round",
    )

    // Final Permutation
    const finalResult = this.finalPermute(preOutput)
    this.addStep(
      20,
      "Final Permutation (FP)",
      "Apply the final permutation (inverse of IP) to get the ciphertext",
      this.formatBits(preOutput),
      this.formatBits(finalResult),
      "FP is the inverse of IP, completing the DES encryption process",
    )

    // Convert back to text
    const ciphertext = this.binaryToText(finalResult)
    this.addStep(
      21,
      "Final Result",
      "Convert the final 64-bit block back to text format",
      this.formatBits(finalResult),
      `"${ciphertext}" (${this.formatBits(finalResult)})`,
      "The encryption process is complete!",
    )
  }

  private feistelFunction(rightHalf: number[], subkey: number[]): number[] {
    // Expansion
    const expanded = this.expand(rightHalf)

    // XOR with subkey
    const xored = expanded.map((bit, i) => bit ^ subkey[i])

    // S-box substitution
    const substituted = this.sBoxSubstitute(xored)

    // P-box permutation
    return this.permute32(substituted)
  }

  private initialPermute(bits: number[]): number[] {
    return this.IP.map((i) => bits[i - 1])
  }

  private finalPermute(bits: number[]): number[] {
    return this.FP.map((i) => bits[i - 1])
  }

  private expand(rHalf: number[]): number[] {
    return this.E.map((i) => rHalf[i - 1])
  }

  private permute32(bits32: number[]): number[] {
    return this.P.map((i) => bits32[i - 1])
  }

  private sBoxSubstitute(bits48: number[]): number[] {
    const out32: number[] = []
    for (let box = 0; box < 8; box++) {
      const chunk = bits48.slice(box * 6, box * 6 + 6)
      const row = (chunk[0] << 1) | chunk[5]
      const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4]

      const val = this.SBOX[box][row * 16 + col]
      out32.push((val >> 3) & 1, (val >> 2) & 1, (val >> 1) & 1, val & 1)
    }
    return out32
  }

  private generateSubkeys(keyBits: number[]): number[][] {
    // Apply PC1 permutation to get 56-bit key
    const pc1Key = this.PC1.map(pos => keyBits[pos - 1])
    
    // Split into left and right halves (28 bits each)
    let c = pc1Key.slice(0, 28)
    let d = pc1Key.slice(28, 56)
    
    const subkeys: number[][] = []
    
    // Generate 16 subkeys
    for (let round = 0; round < 16; round++) {
      // Perform left shifts
      const shifts = this.SHIFTS[round]
      c = [...c.slice(shifts), ...c.slice(0, shifts)]
      d = [...d.slice(shifts), ...d.slice(0, shifts)]
      
      // Combine halves
      const combined = [...c, ...d]
      
      // Apply PC2 permutation to get 48-bit subkey
      const subkey = this.PC2.map(pos => combined[pos - 1])
      subkeys.push(subkey)
    }
    
    return subkeys
  }

  private textToBinary(text: string): number[] {
    const bits: number[] = []
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i)
      for (let j = 7; j >= 0; j--) {
        bits.push((charCode >> j) & 1)
      }
    }
    return bits
  }

  private binaryToText(bits: number[]): string {
    let text = ""
    for (let i = 0; i < bits.length; i += 8) {
      const byte = bits.slice(i, i + 8)
      const charCode = byte.reduce((acc, bit, index) => acc + (bit << (7 - index)), 0)
      text += String.fromCharCode(charCode)
    }
    return text
  }

  private formatBits(bits: number[]): string {
    return this.showBinaryView ? this.bitsToBinary(bits) : this.bitsToHex(bits)
  }

  private bitsToHex(bits: number[]): string {
    let hex = ""
    for (let i = 0; i < bits.length; i += 4) {
      const nibble = bits.slice(i, i + 4)
      const value = nibble.reduce((acc, bit, index) => acc + (bit << (3 - index)), 0)
      hex += value.toString(16).toUpperCase()
    }
    return hex
  }

  private bitsToBinary(bits: number[]): string {
    // Group bits into 8-bit chunks for readability
    const chunks: string[] = []
    for (let i = 0; i < bits.length; i += 8) {
      chunks.push(bits.slice(i, i + 8).join(""))
    }
    return chunks.join(" ")
  }

  private addStep(
    stepNumber: number,
    title: string,
    description: string,
    input: string | number[],
    output: string | number[],
    details?: string,
    roundKey?: string,
  ): void {
    const formatValue = (value: string | number[]): string => {
      if (Array.isArray(value)) {
        return this.formatBits(value)
      }
      return value
    }

    this.steps.push({
      stepNumber,
      title,
      description,
      input: formatValue(input),
      output: formatValue(output),
      details,
      roundKey,
    })
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

  goToStep(index: number): void {
    this.currentStep = index
  }

  reset(): void {
    this.inputText = ""
    this.inputKey = ""
    this.steps = []
    this.currentStep = 0
    this.showBinaryView = false
  }

  toggleBinaryView(): void {
    this.showBinaryView = !this.showBinaryView
    // Update all steps with new format
    this.steps = this.steps.map(step => ({
      ...step,
      input: this.formatValue(step.input),
      output: this.formatValue(step.output)
    }))
  }

  getStepValue(value: string | undefined, index: number): string {
    if (!value) return ''
    const parts = value.split(',')
    if (parts.length <= index) return ''
    const valuePart = parts[index].split(':')
    return valuePart.length > 1 ? valuePart[1].trim() : ''
  }

  getFunctionOutput(details: string | undefined): string {
    if (!details) return ''
    const parts = details.split(':')
    return parts.length > 1 ? parts[1].trim() : ''
  }

  private formatValue(value: string): string {
    // If the value contains a binary or hex pattern, reformat it
    const binaryMatch = value.match(/^[01 ]+$/)
    const hexMatch = value.match(/^[0-9A-F]+$/)
    
    if (binaryMatch || hexMatch) {
      const bits = value.replace(/\s+/g, '').split('').map(char => 
        /^[01]$/.test(char) ? parseInt(char, 2) : 
        parseInt(char, 16).toString(2).padStart(4, '0').split('').map(Number)
      ).flat()
      return this.formatBits(bits)
    }
    
    // Handle compound strings (like "L0: ABCD, R0: EF12")
    const parts = value.split(/[:,]/)
    if (parts.length > 1) {
      return parts.map(part => {
        const [label, val] = part.trim().split(/\s+/)
        return val ? `${label}: ${this.formatValue(val)}` : part.trim()
      }).join(", ")
    }
    
    return value
  }

  getHexOutput(output: string): string {
    // Extract hex value from the output string (format: "text" (HEXVALUE))
    const match = output.match(/\((.*?)\)/)
    return match ? match[1] : output
  }

  getBase64Output(output: string): string {
    // Extract hex value and convert to base64
    const hex = this.getHexOutput(output)
    // Convert hex to bytes
    const bytes = new Uint8Array(
      hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    )
    // Convert bytes to base64
    return btoa(String.fromCharCode(...bytes))
  }

  getRoundKey(roundIndex: number): string {
    if (roundIndex < 0 || !this.steps[this.currentStep]) return ''
    return this.steps[this.currentStep].roundKey || ''
  }
}


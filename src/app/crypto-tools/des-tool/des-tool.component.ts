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
    // Enhanced input validation
    if (!this.inputText || this.inputText.trim() === '') {
      this.showError("Please enter plaintext to encrypt")
      return
    }

    if (!this.inputKey || this.inputKey.trim() === '') {
      this.showError("Please enter a key")
      return
    }

    if (this.inputKey.length !== 8) {
      this.showError("Key must be exactly 8 characters (64 bits)")
      return
    }

    // Validate key contains only printable ASCII characters
    if (!/^[\x20-\x7E]*$/.test(this.inputKey)) {
      this.showError("Key must contain only printable ASCII characters")
      return
    }

    // Validate plaintext contains only printable ASCII characters
    if (!/^[\x20-\x7E]*$/.test(this.inputText)) {
      this.showError("Plaintext must contain only printable ASCII characters")
      return
    }

    this.isProcessing = true
    this.steps = []
    this.currentStep = 0

    try {
      // Convert input to binary - pad plaintext to 8 bytes
      const paddedText = this.inputText.substring(0, 8).padEnd(8, "\0")
      const plainBits = this.textToBinary(paddedText)
    const keyBits = this.textToBinary(this.inputKey)

      // Validate bit arrays
      if (plainBits.length !== 64 || keyBits.length !== 64) {
        throw new Error("Invalid bit conversion - expected 64 bits")
      }

    this.performDES(plainBits, keyBits)
    } catch (error) {
      this.showError(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
    this.isProcessing = false
    }
  }

  private showError(message: string): void {
    alert(message)
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
      if (leftHalf.length !== 32 || rightHalf.length !== 32) {
        throw new Error(`Invalid half lengths before round ${round}: L=${leftHalf.length}, R=${rightHalf.length}`)
      }

      const newLeft = rightHalf.slice()
      const fResult = this.feistelFunction(rightHalf, subkeys[round - 1])
      
      if (fResult.length !== 32) {
        throw new Error(`Invalid F-function result length in round ${round}: ${fResult.length}`)
      }

      const newRight = leftHalf.map((bit, i) => {
        if (bit !== 0 && bit !== 1) {
          throw new Error(`Invalid bit in left half at round ${round}: ${bit}`)
        }
        if (fResult[i] !== 0 && fResult[i] !== 1) {
          throw new Error(`Invalid bit in F-result at round ${round}: ${fResult[i]}`)
        }
        return bit ^ fResult[i]
      })

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
    if (rightHalf.length !== 32) {
      throw new Error(`Invalid right half length: ${rightHalf.length} (expected 32)`)
    }
    if (subkey.length !== 48) {
      throw new Error(`Invalid subkey length: ${subkey.length} (expected 48)`)
    }

    // Expansion
    const expanded = this.expand(rightHalf)
    if (expanded.length !== 48) {
      throw new Error(`Invalid expansion result: ${expanded.length} (expected 48)`)
    }

    // XOR with subkey
    const xored = expanded.map((bit, i) => {
      if (bit !== 0 && bit !== 1) {
        throw new Error(`Invalid bit in expansion: ${bit}`)
      }
      if (subkey[i] !== 0 && subkey[i] !== 1) {
        throw new Error(`Invalid bit in subkey: ${subkey[i]}`)
      }
      return bit ^ subkey[i]
    })

    // S-box substitution
    const substituted = this.sBoxSubstitute(xored)
    if (substituted.length !== 32) {
      throw new Error(`Invalid S-box result: ${substituted.length} (expected 32)`)
    }

    // P-box permutation
    const permuted = this.permute32(substituted)
    if (permuted.length !== 32) {
      throw new Error(`Invalid P-box result: ${permuted.length} (expected 32)`)
    }

    return permuted
  }

  private initialPermute(bits: number[]): number[] {
    if (bits.length !== 64) {
      throw new Error(`Invalid input length for IP: ${bits.length} (expected 64)`)
    }
    return this.IP.map((i) => {
      if (i < 1 || i > 64) {
        throw new Error(`Invalid IP table value: ${i}`)
      }
      return bits[i - 1]
    })
  }

  private finalPermute(bits: number[]): number[] {
    if (bits.length !== 64) {
      throw new Error(`Invalid input length for FP: ${bits.length} (expected 64)`)
    }
    return this.FP.map((i) => {
      if (i < 1 || i > 64) {
        throw new Error(`Invalid FP table value: ${i}`)
      }
      return bits[i - 1]
    })
  }

  private expand(rHalf: number[]): number[] {
    if (rHalf.length !== 32) {
      throw new Error(`Invalid input length for expansion: ${rHalf.length} (expected 32)`)
    }
    return this.E.map((i) => {
      if (i < 1 || i > 32) {
        throw new Error(`Invalid E table value: ${i}`)
      }
      return rHalf[i - 1]
    })
  }

  private permute32(bits32: number[]): number[] {
    if (bits32.length !== 32) {
      throw new Error(`Invalid input length for P permutation: ${bits32.length} (expected 32)`)
    }
    return this.P.map((i) => {
      if (i < 1 || i > 32) {
        throw new Error(`Invalid P table value: ${i}`)
      }
      return bits32[i - 1]
    })
  }

  private sBoxSubstitute(bits48: number[]): number[] {
    if (bits48.length !== 48) {
      throw new Error(`Invalid input length for S-box: ${bits48.length} (expected 48)`)
    }

    const out32: number[] = []
    for (let box = 0; box < 8; box++) {
      const chunk = bits48.slice(box * 6, box * 6 + 6)
      if (chunk.length !== 6) {
        throw new Error(`Invalid S-box chunk length: ${chunk.length}`)
      }

      const row = (chunk[0] << 1) | chunk[5]
      const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4]

      if (row < 0 || row > 3 || col < 0 || col > 15) {
        throw new Error(`Invalid S-box coordinates: row=${row}, col=${col}`)
      }

      const val = this.SBOX[box][row * 16 + col]
      out32.push((val >> 3) & 1, (val >> 2) & 1, (val >> 1) & 1, val & 1)
    }
    return out32
  }

  private generateSubkeys(keyBits: number[]): number[][] {
    if (keyBits.length !== 64) {
      throw new Error(`Invalid key length: ${keyBits.length} (expected 64)`)
    }

    // Apply PC1 permutation to get 56-bit key
    const pc1Key = this.PC1.map(pos => {
      if (pos < 1 || pos > 64) {
        throw new Error(`Invalid PC1 table value: ${pos}`)
      }
      return keyBits[pos - 1]
    })
    
    // Split into left and right halves (28 bits each)
    let c = pc1Key.slice(0, 28)
    let d = pc1Key.slice(28, 56)
    
    const subkeys: number[][] = []
    
    // Generate 16 subkeys
    for (let round = 0; round < 16; round++) {
      // Perform left shifts
      const shifts = this.SHIFTS[round]
      if (shifts < 1 || shifts > 2) {
        throw new Error(`Invalid shift value for round ${round}: ${shifts}`)
      }
      c = [...c.slice(shifts), ...c.slice(0, shifts)]
      d = [...d.slice(shifts), ...d.slice(0, shifts)]
      
      // Combine halves
      const combined = [...c, ...d]
      if (combined.length !== 56) {
        throw new Error(`Invalid combined key length: ${combined.length}`)
      }
      
      // Apply PC2 permutation to get 48-bit subkey
      const subkey = this.PC2.map(pos => {
        if (pos < 1 || pos > 56) {
          throw new Error(`Invalid PC2 table value: ${pos}`)
        }
        return combined[pos - 1]
      })
      
      if (subkey.length !== 48) {
        throw new Error(`Invalid subkey length: ${subkey.length}`)
      }
      subkeys.push(subkey)
    }
    
    return subkeys
  }

  private textToBinary(text: string): number[] {
    if (text.length > 8) {
      throw new Error(`Text too long: ${text.length} characters (max 8)`)
    }
    
    const bits: number[] = []
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i)
      if (charCode > 255) {
        throw new Error(`Non-ASCII character at position ${i}: ${text.charAt(i)}`)
      }
      for (let j = 7; j >= 0; j--) {
        bits.push((charCode >> j) & 1)
      }
    }
    
    // Pad to 64 bits if necessary
    while (bits.length < 64) {
      bits.push(0)
    }
    
    return bits
  }

  private binaryToText(bits: number[]): string {
    if (bits.length !== 64) {
      throw new Error(`Invalid bit array length: ${bits.length} (expected 64)`)
    }
    
    let text = ""
    for (let i = 0; i < bits.length; i += 8) {
      const byte = bits.slice(i, i + 8)
      const charCode = byte.reduce((acc, bit, index) => {
        if (bit !== 0 && bit !== 1) {
          throw new Error(`Invalid bit value: ${bit}`)
        }
        return acc + (bit << (7 - index))
      }, 0)
      text += String.fromCharCode(charCode)
    }
    return text
  }

  private formatBits(bits: number[]): string {
    return this.showBinaryView ? this.bitsToBinary(bits) : this.bitsToHex(bits)
  }

  private bitsToHex(bits: number[]): string {
    if (bits.length % 4 !== 0) {
      throw new Error(`Invalid bit array length: ${bits.length} (must be multiple of 4)`)
    }
    
    let hex = ""
    for (let i = 0; i < bits.length; i += 4) {
      const nibble = bits.slice(i, i + 4)
      if (nibble.length !== 4) {
        throw new Error(`Invalid nibble length: ${nibble.length}`)
      }
      const value = nibble.reduce((acc, bit, index) => {
        if (bit !== 0 && bit !== 1) {
          throw new Error(`Invalid bit value: ${bit}`)
        }
        return acc + (bit << (3 - index))
      }, 0)
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
    // Handle compound strings (like "L0: ABCD, R0: EF12")
    if (value.includes(':') && value.includes(',')) {
      const parts = value.split(',')
      return parts.map(part => {
        const trimmed = part.trim()
        const colonIndex = trimmed.indexOf(':')
        if (colonIndex !== -1) {
          const label = trimmed.substring(0, colonIndex + 1)
          const val = trimmed.substring(colonIndex + 1).trim()
          return `${label} ${this.formatSingleValue(val)}`
        }
        return trimmed
      }).join(', ')
    }
    
    return this.formatSingleValue(value)
  }

  private formatSingleValue(value: string): string {
    // If it's already formatted properly, return as is
    if (value.includes(' ') || value.length <= 8) {
      return value
    }
    
    // Check if it's a hex string
    if (/^[0-9A-F]+$/i.test(value) && value.length % 2 === 0) {
      try {
        // Convert hex to bits and reformat
        const bits: number[] = []
        for (let i = 0; i < value.length; i += 2) {
          const byte = parseInt(value.substr(i, 2), 16)
          for (let j = 7; j >= 0; j--) {
            bits.push((byte >> j) & 1)
          }
        }
        return this.formatBits(bits)
      } catch (error) {
        // If conversion fails, return original
        return value
      }
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


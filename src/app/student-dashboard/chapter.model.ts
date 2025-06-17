export interface Chapter {
  id: number
  title: string
  description: string
  topics: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  estimatedTime: string
  completed: boolean
  locked?: boolean
  route?: string
} 
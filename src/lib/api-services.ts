export interface PhoneValidationResult {
  number: string
  number: string
  lineType: 'mobile' | 'landline' | 'voip' | 'unknown'
  canReceiveSms: b

  valid: boolean
 

  deliverable: boolean

  valid: boolean
  disposable: bo
  score: numbe

  date: string
  country: string
}

export interface EmailValidationResult {
  valid: boolean
  email: string
  disposable: boolean
  roleAccount: boolean
  score: number
}

export interface PublicHoliday {
  date: string
  name: string
  country: string
  type: 'public' | 'bank' | 'observance'
}

export interface DrugInfo {
  brandName: string
  genericName: string
  activeIngredients: string[]
}
export class APIServices {

 

        number: phoneNumbe
        carrie
        canReceiveSms
    }
    try {
 

      const data = await response
        valid: 
        lineType: d
        location: 
      }
 


    street: string

  }): Promise<AddressValidationResult> {
      const validZipCodes
      return {
        format
        city: address.city,
        zipCode: address.zip
      }

      const response = await fetch
        headers: { 'Content-Type
      }
     

        c
        zipCode: data.zipcode,
      }
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      })
      const data = await response.json()
      return {
        valid: data.valid,
        number: data.number,
        lineType: data.line_type,
        carrier: data.carrier,
        location: data.location,
        canReceiveSms: data.line_type === 'mobile',
      }
    } catch (error) {
      console.error('Phone validation error:', error)
      return { valid: false, number: phoneNumber, lineType: 'unknown', canReceiveSms: false }
    }
  }

  static async validateAddress(address: {
    street: string
    city: string
    state: string
    zipCode: string
  }): Promise<AddressValidationResult> {
    if (this.MOCK_MODE) {
      const validZipCodes = ['90210', '10001', '60614', '33139', '78701']
      const isValid = validZipCodes.includes(address.zipCode)
      return {
        valid: isValid,
        formatted: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        deliverable: isValid,
      }
    }

    try {
      const response = await fetch(`https://api.smarty.com/street-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      })
      const data = await response.json()
      return {
        valid: data.valid,
        formatted: data.delivery_line_1,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipcode,
        deliverable: data.dpv_match_code === 'Y',
      }
    } catch (error) {
      console.error('Address validation error:', error)
      return {
        valid: false,
        formatted: '',
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        deliverable: false,
      }
    }
  }

  static async validateEmail(email: string): Promise<EmailValidationResult> {
    if (this.MOCK_MODE) {
      const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com']
      const domain = email.split('@')[1]
      const isDisposable = disposableDomains.some(d => domain?.includes(d))
      const isRole = email.startsWith('admin') || email.startsWith('info') || email.startsWith('support')
      return {
        valid: email.includes('@') && email.includes('.'),
        email,
        disposable: isDisposable,
        roleAccount: isRole,
        score: isDisposable ? 30 : 95,
      }
    }

    try {
      const response = await fetch(`https://api.eva.pingutil.com/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      return {
        valid: data.valid,
        email: data.email,
        disposable: data.disposable,
        roleAccount: data.role,
        score: data.score,
      }
    } catch (error) {
      console.error('Email validation error:', error)
      return { valid: false, email, disposable: false, roleAccount: false, score: 0 }
    }
  }

  static async getPublicHolidays(year: number, countryCode: string = 'US'): Promise<PublicHoliday[]> {
    if (this.MOCK_MODE) {
      return [
        { date: `${year}-01-01`, name: "New Year's Day", country: 'US', type: 'public' },
        { date: `${year}-07-04`, name: 'Independence Day', country: 'US', type: 'public' },
        { date: `${year}-11-28`, name: 'Thanksgiving', country: 'US', type: 'public' },
        { date: `${year}-12-25`, name: 'Christmas Day', country: 'US', type: 'public' },
      ]
    }

    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`)
      const data = await response.json()
      return data.map((h: any) => ({
        date: h.date,
        name: h.name,
        country: countryCode,
        type: h.type,
      }))
    } catch (error) {
      console.error('Holiday fetch error:', error)
      return []
    }
  }

  static async getDrugInfo(drugName: string): Promise<DrugInfo | null> {
    if (this.MOCK_MODE) {
      const mockDrugs: Record<string, DrugInfo> = {
        'lisinopril': {
          brandName: 'Zestril',
          genericName: 'Lisinopril',
          activeIngredients: ['Lisinopril'],
          warnings: ['May cause dizziness', 'Do not use if pregnant', 'Monitor kidney function'],
          recalls: [],
          adverseEvents: [
            { symptom: 'Cough', frequency: 'Common (3-5%)' },
            { symptom: 'Dizziness', frequency: 'Common (5-10%)' },
          ],
        },
        'metformin': {
          brandName: 'Glucophage',
          genericName: 'Metformin',
          activeIngredients: ['Metformin Hydrochloride'],
          warnings: ['May cause lactic acidosis', 'Hold before surgery', 'Monitor kidney function'],
          recalls: [],
          adverseEvents: [
            { symptom: 'Nausea', frequency: 'Very Common (10-20%)' },
            { symptom: 'Diarrhea', frequency: 'Very Common (10-15%)' },
          ],
        },
      }
      return mockDrugs[drugName.toLowerCase()] || null
    }

    try {
      const response = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${encodeURIComponent(drugName)}&limit=1`
      )
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          brandName: result.openfda?.brand_name?.[0] || drugName,
          genericName: result.openfda?.generic_name?.[0] || '',
          activeIngredients: result.openfda?.substance_name || [],
          warnings: result.warnings || [],
          recalls: [],
          adverseEvents: [],
        }
      }
      return null
    } catch (error) {
      console.error('Drug info error:', error)
      return null
    }
  }

  static async searchICD10(searchTerm: string): Promise<ICDCode[]> {
    if (this.MOCK_MODE) {
      const mockCodes: Record<string, ICDCode[]> = {
        'hypertension': [
          { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular', billable: true },
          { code: 'I11.0', description: 'Hypertensive heart disease with heart failure', category: 'Cardiovascular', billable: true },
          { code: 'I12.9', description: 'Hypertensive chronic kidney disease', category: 'Cardiovascular', billable: true },
        ],
        'diabetes': [
          { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine', billable: true },
          { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia', category: 'Endocrine', billable: true },
          { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications', category: 'Endocrine', billable: true },
        ],
        'flu': [
          { code: 'J11.1', description: 'Influenza due to unidentified influenza virus', category: 'Respiratory', billable: true },
          { code: 'J10.1', description: 'Influenza with other respiratory manifestations', category: 'Respiratory', billable: true },
        ],
      }
      
      const matchingKey = Object.keys(mockCodes).find(key => 
        searchTerm.toLowerCase().includes(key) || key.includes(searchTerm.toLowerCase())
      )
      
      return matchingKey ? mockCodes[matchingKey] : []
    }

    try {
      const response = await fetch(
        `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(searchTerm)}`
      )
      const data = await response.json()
      if (data[3]) {
        return data[3].map((item: any) => ({
          code: item[0],
          description: item[1],
          category: 'Medical',
          billable: true,
        }))
      }
      return []
    } catch (error) {
      console.error('ICD-10 search error:', error)
      return []
    }
  }

  static async scanFile(file: File): Promise<FileScanResult> {
    if (this.MOCK_MODE) {
      const dangerousNames = ['virus', 'malware', 'ransomware']
      const isSafe = !dangerousNames.some(name => file.name.toLowerCase().includes(name))
      return {
        safe: isSafe,
        threats: isSafe ? [] : ['Potentially malicious file detected'],
        scanDate: new Date().toISOString(),
        fileHash: `mock-hash-${Date.now()}`,
      }
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('https://www.virustotal.com/api/v3/files', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      return {
        safe: data.data.attributes.last_analysis_stats.malicious === 0,
        threats: data.data.attributes.threat_names || [],
        scanDate: data.data.attributes.last_analysis_date,
        fileHash: data.data.id,
      }
    } catch (error) {
      console.error('File scan error:', error)
      return {
        safe: true,
        threats: [],
        scanDate: new Date().toISOString(),
        fileHash: '',
      }
    }
  }

  static async sendTransactionalSMS(phoneNumber: string, message: string): Promise<boolean> {
    if (this.MOCK_MODE) {
      console.log(`[MOCK SMS] To: ${phoneNumber}, Message: ${message}`)
      return true
    }

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, message }),
      })
      return response.ok
    } catch (error) {
      console.error('SMS send error:', error)
      return false
    }
  }

  static isHoliday(date: Date, holidays: PublicHoliday[]): boolean {
    const dateStr = date.toISOString().split('T')[0]
    return holidays.some(h => h.date === dateStr)
  }
}
    } catch (error) {
      console.error('Address validation error:', error)
      return {
        valid: false,
        formatted: '',
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        deliverable: false,
      }
    }
  }

  static async validateEmail(email: string): Promise<EmailValidationResult> {
    if (this.MOCK_MODE) {
      const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com']
      const domain = email.split('@')[1]
      const isDisposable = disposableDomains.some(d => domain?.includes(d))
      const isRole = email.startsWith('admin') || email.startsWith('info') || email.startsWith('support')
      return {
        valid: email.includes('@') && email.includes('.'),
        email,
        disposable: isDisposable,
        roleAccount: isRole,
        score: isDisposable ? 30 : 95,
      }
    }

    try {
      const response = await fetch(`https://api.eva.pingutil.com/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      return {
        valid: data.valid,
        email: data.email,
        disposable: data.disposable,
        roleAccount: data.role,
        score: data.score,
      }
    } catch (error) {
      console.error('Email validation error:', error)
      return { valid: false, email, disposable: false, roleAccount: false, score: 0 }
    }
  }

  static async getPublicHolidays(year: number, countryCode: string = 'US'): Promise<PublicHoliday[]> {
    if (this.MOCK_MODE) {
      return [
        { date: `${year}-01-01`, name: "New Year's Day", country: 'US', type: 'public' },
        { date: `${year}-07-04`, name: 'Independence Day', country: 'US', type: 'public' },
        { date: `${year}-11-28`, name: 'Thanksgiving', country: 'US', type: 'public' },
        { date: `${year}-12-25`, name: 'Christmas Day', country: 'US', type: 'public' },
      ]
    }

    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`)
      const data = await response.json()
      return data.map((h: any) => ({
        date: h.date,
        name: h.name,
        country: countryCode,
        type: h.type,
      }))
    } catch (error) {
      console.error('Holiday fetch error:', error)
      return []
    }
  }

  static async getDrugInfo(drugName: string): Promise<DrugInfo | null> {
    if (this.MOCK_MODE) {
      const mockDrugs: Record<string, DrugInfo> = {
        'lisinopril': {
          brandName: 'Zestril',
          genericName: 'Lisinopril',
          activeIngredients: ['Lisinopril'],
          warnings: ['May cause dizziness', 'Do not use if pregnant', 'Monitor kidney function'],
          recalls: [],
          adverseEvents: [
            { symptom: 'Cough', frequency: 'Common (3-5%)' },
            { symptom: 'Dizziness', frequency: 'Common (5-10%)' },
          ],
        },
        'metformin': {
          brandName: 'Glucophage',
          genericName: 'Metformin',
          activeIngredients: ['Metformin Hydrochloride'],
          warnings: ['May cause lactic acidosis', 'Hold before surgery', 'Monitor kidney function'],
          recalls: [],
          adverseEvents: [
            { symptom: 'Nausea', frequency: 'Very Common (10-20%)' },
            { symptom: 'Diarrhea', frequency: 'Very Common (10-15%)' },
          ],
        },
      }
      return mockDrugs[drugName.toLowerCase()] || null
    }

    try {
      const response = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${encodeURIComponent(drugName)}&limit=1`
      )
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          brandName: result.openfda?.brand_name?.[0] || drugName,
          genericName: result.openfda?.generic_name?.[0] || '',
          activeIngredients: result.openfda?.substance_name || [],
          warnings: result.warnings || [],
          recalls: [],
          adverseEvents: [],
        }
      }
      return null
    } catch (error) {
      console.error('Drug info error:', error)
      return null
    }
  }

  static async searchICD10(searchTerm: string): Promise<ICDCode[]> {
    if (this.MOCK_MODE) {
      const mockCodes: Record<string, ICDCode[]> = {
        'hypertension': [
          { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular', billable: true },
          { code: 'I11.0', description: 'Hypertensive heart disease with heart failure', category: 'Cardiovascular', billable: true },
          { code: 'I12.9', description: 'Hypertensive chronic kidney disease', category: 'Cardiovascular', billable: true },
        ],
        'diabetes': [
          { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine', billable: true },
          { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia', category: 'Endocrine', billable: true },
          { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications', category: 'Endocrine', billable: true },
        ],
        'flu': [
          { code: 'J11.1', description: 'Influenza due to unidentified influenza virus', category: 'Respiratory', billable: true },
          { code: 'J10.1', description: 'Influenza with other respiratory manifestations', category: 'Respiratory', billable: true },
        ],
      }
      
      const matchingKey = Object.keys(mockCodes).find(key => 
        searchTerm.toLowerCase().includes(key) || key.includes(searchTerm.toLowerCase())
      )
      
      return matchingKey ? mockCodes[matchingKey] : []
    }

    try {
      const response = await fetch(
        `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(searchTerm)}`
      )
      const data = await response.json()
      if (data[3]) {
        return data[3].map((item: any) => ({
          code: item[0],
          description: item[1],
          category: 'Medical',
          billable: true,
        }))
      }
      return []
    } catch (error) {
      console.error('ICD-10 search error:', error)
      return []
    }
  }

  static async scanFile(file: File): Promise<FileScanResult> {
    if (this.MOCK_MODE) {
      const dangerousNames = ['virus', 'malware', 'ransomware']
      const isSafe = !dangerousNames.some(name => file.name.toLowerCase().includes(name))
      return {
        safe: isSafe,
        threats: isSafe ? [] : ['Potentially malicious file detected'],
        scanDate: new Date().toISOString(),
        fileHash: `mock-hash-${Date.now()}`,
      }
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('https://www.virustotal.com/api/v3/files', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      return {
        safe: data.data.attributes.last_analysis_stats.malicious === 0,
        threats: data.data.attributes.threat_names || [],
        scanDate: data.data.attributes.last_analysis_date,
        fileHash: data.data.id,
      }
    } catch (error) {
      console.error('File scan error:', error)
      return {
        safe: true,
        threats: [],
        scanDate: new Date().toISOString(),
        fileHash: '',
      }
    }
  }

  static async sendTransactionalSMS(phoneNumber: string, message: string): Promise<boolean> {
    if (this.MOCK_MODE) {
      console.log(`[MOCK SMS] To: ${phoneNumber}, Message: ${message}`)
      return true
    }

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, message }),
      })
      return response.ok
    } catch (error) {
      console.error('SMS send error:', error)
      return false
    }
  }

  static isHoliday(date: Date, holidays: PublicHoliday[]): boolean {
    const dateStr = date.toISOString().split('T')[0]
    return holidays.some(h => h.date === dateStr)
  }
}

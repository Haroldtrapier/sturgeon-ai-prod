import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

// Import pdf-parse dynamically to avoid type issues
const pdfParse = require('pdf-parse')

export const config = {
  api: {
    bodyParser: false,
  },
}

async function extractTextFromFile(filepath: string, mimetype: string): Promise<string> {
  try {
    if (mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filepath)
      const data = await pdfParse(dataBuffer)
      return data.text
    } else if (mimetype === 'text/plain' || mimetype.includes('text')) {
      return fs.readFileSync(filepath, 'utf-8')
    }
    return ''
  } catch (error) {
    console.error('Error extracting text:', error)
    return ''
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({ multiples: false })

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err)
        return res.status(500).json({ error: 'Failed to parse upload' })
      }

      const fileOrFiles = files.file
      const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      const filename = file.originalFilename || 'unnamed'
      const filepath = file.filepath
      const mimetype = file.mimetype || ''

      try {
        // Extract text from the file
        const text = await extractTextFromFile(filepath, mimetype)

        // Insert into database
        const { data, error } = await supabase
          .from('documents')
          .insert({
            filename,
            text,
          })
          .select()
          .single()

        if (error) {
          console.error('Error inserting document:', error)
          return res.status(500).json({ error: 'Failed to save document' })
        }

        return res.status(200).json({ 
          success: true, 
          document: data 
        })
      } finally {
        // Clean up uploaded file
        try {
          fs.unlinkSync(filepath)
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError)
        }
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

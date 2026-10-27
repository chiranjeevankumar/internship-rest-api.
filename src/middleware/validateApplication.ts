import { Request, Response, NextFunction } from 'express';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateApplicationInput(req: Request, res: Response, next: NextFunction): void {
  const { internshipId, applicantName, email, coverLetter } = req.body || {};
  const errors: string[] = [];

  // Internship ID validation
  if (!internshipId || typeof internshipId !== 'string' || internshipId.trim().length === 0) {
    errors.push("Field 'internshipId' is required and must be a valid string.");
  }

  // Applicant Name validation
  if (!applicantName || typeof applicantName !== 'string') {
    errors.push("Field 'applicantName' is required.");
  } else {
    const trimmedName = applicantName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      errors.push("Field 'applicantName' must be between 2 and 100 characters.");
    }
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push("Field 'email' is required.");
  } else {
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 100) {
      errors.push("Field 'email' must be a valid email address (max 100 characters).");
    }
  }

  // Cover Letter validation
  if (!coverLetter || typeof coverLetter !== 'string') {
    errors.push("Field 'coverLetter' is required.");
  } else {
    const trimmedLetter = coverLetter.trim();
    if (trimmedLetter.length < 20 || trimmedLetter.length > 2000) {
      errors.push("Field 'coverLetter' must be between 20 and 2000 characters.");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation Failed',
      details: errors
    });
    return;
  }

  next();
}

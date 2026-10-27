import { Request, Response, NextFunction } from 'express';

export function validateInternshipInput(isUpdate = false) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { id, title, domain, location, skills, openings } = req.body;
    const errors: string[] = [];

    // Optional ID validation on create if provided
    if (!isUpdate && id !== undefined && id !== null) {
      if (typeof id !== 'string' || id.trim().length === 0) {
        errors.push("Field 'id' must be a non-empty string if provided.");
      }
    }

    // Title validation
    if (!isUpdate || title !== undefined) {
      if (title === undefined || title === null) {
        errors.push("Field 'title' is required.");
      } else if (typeof title !== 'string' || title.trim().length < 2) {
        errors.push("Field 'title' must be a string with at least 2 characters.");
      }
    }

    // Domain validation
    if (!isUpdate || domain !== undefined) {
      if (domain === undefined || domain === null) {
        errors.push("Field 'domain' is required.");
      } else if (typeof domain !== 'string' || domain.trim().length < 2) {
        errors.push("Field 'domain' must be a string with at least 2 characters.");
      }
    }

    // Location validation
    if (!isUpdate || location !== undefined) {
      if (location === undefined || location === null) {
        errors.push("Field 'location' is required.");
      } else if (typeof location !== 'string' || location.trim().length < 2) {
        errors.push("Field 'location' must be a string with at least 2 characters.");
      }
    }

    // Skills validation
    if (!isUpdate || skills !== undefined) {
      if (skills === undefined || skills === null) {
        errors.push("Field 'skills' is required.");
      } else if (Array.isArray(skills)) {
        if (skills.length === 0 || skills.some((s) => typeof s !== 'string' || s.trim().length === 0)) {
          errors.push("Field 'skills' must be a non-empty string or array of non-empty strings.");
        }
      } else if (typeof skills !== 'string' || skills.trim().length === 0) {
        errors.push("Field 'skills' must be a non-empty string or array of non-empty strings.");
      }
    }

    // Openings validation
    if (!isUpdate || openings !== undefined) {
      if (openings === undefined || openings === null) {
        errors.push("Field 'openings' is required.");
      } else if (!Number.isInteger(Number(openings)) || Number(openings) < 0) {
        errors.push("Field 'openings' must be a non-negative integer (0 or greater).");
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
  };
}

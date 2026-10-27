import { Request, Response, NextFunction } from 'express';

export function validateInternshipInput(isUpdate = false) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { id, title, description, domain, location, skills, openings } = req.body;
    const errors: string[] = [];

    // Disallow client-supplied ID on creation
    if (!isUpdate && id !== undefined && id !== null) {
      errors.push("Field 'id' should not be provided; IDs are auto-generated.");
    }

    // Title validation
    if (!isUpdate || title !== undefined) {
      if (title === undefined || title === null) {
        errors.push("Field 'title' is required.");
      } else if (typeof title !== 'string' || title.trim().length < 2) {
        errors.push("Field 'title' must be a string with at least 2 characters.");
      }
    }

    // Description validation
    if (!isUpdate || description !== undefined) {
      if (description === undefined || description === null) {
        errors.push("Field 'description' is required.");
      } else if (typeof description !== 'string' || description.trim().length < 5) {
        errors.push("Field 'description' must be a string with at least 5 characters.");
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
          errors.push("Field 'skills' must be a non-empty array of non-empty strings or string.");
        }
      } else if (typeof skills !== 'string' || skills.trim().length === 0) {
        errors.push("Field 'skills' must be a non-empty array of non-empty strings or string.");
      }
    }

    // Openings validation (must be positive integer > 0)
    if (!isUpdate || openings !== undefined) {
      if (openings === undefined || openings === null) {
        errors.push("Field 'openings' is required.");
      } else {
        const openingsNum = Number(openings);
        if (!Number.isInteger(openingsNum) || openingsNum <= 0) {
          errors.push("Field 'openings' must be a positive integer greater than zero.");
        }
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

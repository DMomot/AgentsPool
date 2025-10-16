"""Utility functions for generating URL-friendly slugs"""
import re


def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from name"""
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')


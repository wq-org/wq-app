Good Git commit message should contain:

- **Brief Summary**: Start with a short summary (50 characters or less) of the changes.
- **Detailed Description**: Follow up with a more detailed explanation (72 characters per line) if necessary.
- **Context**: Explain why the change was made and any relevant background.
- **References**: Include references to issues or tasks (e.g., "Fixes #123") if applicable.
- **Imperative Mood**: Use the imperative mood (e.g., "Add feature" instead of "Added feature").

### Example Format:
```
Short summary of the change

Detailed description (if needed) explaining the why and how.
```

### Tips:
- Keep it clear and concise.
- Avoid vague terms like "fix" or "update" without context.


### Details:
Date: $(date +"%d.%m.%Y")
Branch: $(git branch --show-current)
User: $(git config user.name)
Email: $(git config user.email)
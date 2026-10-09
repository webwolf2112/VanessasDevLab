# CI/CD Security — Video 1: Why Your Workflow Is a Target

Your DevOps team set up the pipelines, but that custom workflow or PR bot you added is yours, and so are its mistakes. Attackers know it.

## TL;DR

Your workflow runs other people's code with your keys. Any code running in your job can read every secret that job has.

## The attack: `actions-cool/issues-helper`

On **May 18, 2026**, attackers moved all 53 version tags of the popular `actions-cool/issues-helper` action to a malicious commit. Every workflow using `@v3` ran it on its next run, with no code change on their end. A tag is a sticky note, and someone moved it.

The payload read secrets straight out of the runner's memory and sent them to the attacker, so log masking didn't help. On **September 16** the repos came back online with the bad tags still in place and infected workflows again. Workflows pinned to a commit SHA were safe both times.

This isn't a one-off: the same tag trick hit `tj-actions/changed-files` in March 2025.

- [StepSecurity: original research](https://www.stepsecurity.io/blog/actions-cool-issues-helper-github-action-compromised-all-tags-point-to-imposter-commit-that-exfiltrates-ci-cd-credentials)
- [The Hacker News: the September comeback](https://thehackernews.com/2026/09/compromised-github-actions-came-back.html)

## OWASP risk

From the [OWASP Top 10 CI/CD Security Risks](https://owasp.org/www-project-top-10-ci-cd-security-risks/):

- **[CICD-SEC-3: Dependency Chain Abuse](https://owasp.org/www-project-top-10-ci-cd-security-risks/CICD-SEC-03-Dependency-Chain-Abuse):** the pipeline trusted a third-party action it never verified.
- **[CICD-SEC-6: Insufficient Credential Hygiene](https://owasp.org/www-project-top-10-ci-cd-security-risks/CICD-SEC-06-Insufficient-Credential-Hygiene):** jobs held secrets the attacker could steal.

## The demo file

[`insecureIssueReporterAction.yaml`](insecureIssueReporterAction.yaml) has four common mistakes (it's intentionally insecure, so don't copy it):

1. A secret typed straight into the YAML
2. No `permissions:` block
3. An action pinned to a tag (`@v4`) instead of a commit SHA
4. `${{ github.event.pull_request.title }}` used inside `run:`

Scan it yourself with [zizmor](https://github.com/zizmorcore/zizmor):

```bash
zizmor insecureIssueReporterAction.yaml
```

The next videos fix each of these, one at a time.

## Try it

Open one of your own workflows and list every secret and every `github.event` value it uses.

## Watch the video

Coming soon on [Vanessa's Dev Lab](https://www.youtube.com/@VanessasDevLab). Next up: getting secrets out of your YAML.

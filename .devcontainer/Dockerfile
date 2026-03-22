FROM debian:trixie

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Layer: Base OS packages (most stable — changes only when adding/removing system tools)
RUN apt-get update && apt-get install -y \
  curl \
  git \
  jq \
  fzf \
  zsh \
  sudo \
  iptables \
  ipset \
  iproute2 \
  dnsutils \
  libatomic1 \
  && rm -rf /var/lib/apt/lists/*

# Layer: GitHub CLI (separate — requires third-party apt repo not in Debian trixie)
# https://github.com/cli/cli/blob/trunk/docs/install_linux.md
RUN mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
     -o /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
     > /etc/apt/sources.list.d/github-cli.list \
  && apt-get update \
  && apt-get install -y gh \
  && rm -rf /var/lib/apt/lists/*

# Layer: uv binary (copy from official image)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Layer: git-delta (latest release, display tool — not pinned)
# Asset pattern: delta-*-x86_64-unknown-linux-gnu.tar.gz
# Releases: https://github.com/dandavison/delta/releases/latest
RUN DELTA_VERSION=$(curl -sf https://api.github.com/repos/dandavison/delta/releases/latest \
      | jq -r '.tag_name') \
  && curl -sL "https://github.com/dandavison/delta/releases/download/${DELTA_VERSION}/delta-${DELTA_VERSION}-x86_64-unknown-linux-gnu.tar.gz" \
     | tar -xz --strip-components=1 -C /usr/local/bin \
       "delta-${DELTA_VERSION}-x86_64-unknown-linux-gnu/delta" \
  && chmod +x /usr/local/bin/delta

# Layer: vscode user (UID 1000, zsh as default shell)
# All shell configuration (zsh, Oh My Zsh, powerlevel10k) installed directly in Dockerfile
RUN groupadd -g 1000 vscode \
  && useradd -m -u 1000 -g 1000 -s /bin/zsh vscode

# Layer: Firewall script + sudoers (vscode may run this script as root only)
COPY init-firewall.sh /usr/local/share/init-firewall.sh
RUN chmod +x /usr/local/share/init-firewall.sh \
  && echo "vscode ALL=(root) NOPASSWD: /usr/local/share/init-firewall.sh" \
     > /etc/sudoers.d/vscode-firewall \
  && chmod 0440 /etc/sudoers.d/vscode-firewall

# Layer: Shell history directory (must be created as root; owned by vscode for zsh writes)
RUN mkdir -p /commandhistory && chown vscode:vscode /commandhistory

# Switch to vscode user for all per-user installs
USER vscode
WORKDIR /home/vscode

# Ensure uv tool binaries are on PATH (Oh My Zsh does not add ~/.local/bin by default)
ENV PATH="/home/vscode/.local/bin:${PATH}"

# Layer: Oh My Zsh (unattended — creates ~/.zshrc with OMZ setup)
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Layer: Powerlevel10k theme + p10k-rainbow preset config
# Fonts render on the host; install MesloLGS NF on your host OS for Nerd Font glyph support
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
    ${HOME}/.oh-my-zsh/custom/themes/powerlevel10k \
  && sed -i 's|^ZSH_THEME=.*|ZSH_THEME="powerlevel10k/powerlevel10k"|' ${HOME}/.zshrc \
  && cp ${HOME}/.oh-my-zsh/custom/themes/powerlevel10k/config/p10k-rainbow.zsh ${HOME}/.p10k.zsh

# Layer: p10k instant prompt + source + visual overrides from zsh-in-docker
# Instant prompt must load before Oh My Zsh; source line must load after all other setup
# POWERLEVEL9K_* overrides appended after source to take effect on top of the preset
RUN { printf '%s\n' \
      'if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then' \
      '  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"' \
      'fi' \
      ''; cat ${HOME}/.zshrc; } > /tmp/.zshrc \
  && mv /tmp/.zshrc ${HOME}/.zshrc \
  && printf '\n[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh\n' >> ${HOME}/.zshrc \
  && { printf '%s\n' \
      '' \
      '# Prompt layout overrides (from zsh-in-docker defaults)' \
      'POWERLEVEL9K_SHORTEN_STRATEGY="truncate_to_last"' \
      'POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(user dir vcs status)' \
      'POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=()' \
      'POWERLEVEL9K_STATUS_OK=false' \
      'POWERLEVEL9K_STATUS_CROSS=true'; } >> ${HOME}/.zshrc

# Layer: Shell history persistence (wires zsh HISTFILE to the devcontainer-history volume mount)
ENV HISTFILE=/commandhistory/.zsh_history

# Layer: nvm + Node.js 22
# nvm installer auto-adds sourcing to ~/.bashrc and ~/.zshrc
ENV NVM_DIR=/home/vscode/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash \
  && . "${NVM_DIR}/nvm.sh" \
  && nvm install 22 \
  && nvm alias default 22

# Layer: Python 3.12 via uv
RUN uv python install 3.12

# Layer: pre-commit via uv tool (isolated env — no --break-system-packages needed)
# Installed after Python 3.12 so uv uses that interpreter
RUN uv tool install pre-commit

# Layer: Atuin (shell history — graceful fallback if install fails)
RUN curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh || true; \
  if command -v atuin &>/dev/null || [ -f "$HOME/.atuin/bin/atuin" ]; then \
    echo 'eval "$(atuin init zsh)"' >> ${HOME}/.zshrc; \
  fi

# Layer: git-delta configured as pager
RUN git config --global core.pager delta

# Layer: Claude Code CLI
RUN . "${NVM_DIR}/nvm.sh" \
  && npm install -g @anthropic-ai/claude-code@latest

FROM node:12

MAINTAINER dispatch <admin@bitwave.tv>

# Install global npm packages
RUN npm install -g typescript

# Install npm packages
COPY package.json package-lock.json /bitwave/
RUN cd /bitwave && \
    npm ci && \
    npm cache verify

# Copy source code
COPY . /bitwave
WORKDIR /bitwave

# Build server
RUN cd /bitwave && \
    npm run build && \
    npm prune --production

# Expose port
EXPOSE 3000

# Start server
CMD [ "npm", "start" ]

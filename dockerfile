# ### BASE
# FROM node:latest AS base
# # Set the working directory
# WORKDIR /app
# # Copy project specification and dependencies lock files
# COPY *.json ./
# # COPY pub-sub-key.json ./
# # COPY .env ./
# # Install Node.js development dependencies if --build-arg DEBUG=1, or production dependencies
# RUN yarn install && yarn build
# RUN ls

### RELEASE
FROM node:latest AS relase
WORKDIR /app
# COPY --from=base /app/dist ./dist
COPY ./dist ./dist
COPY . .

# Run
CMD [ "yarn", "start:prod" ]
